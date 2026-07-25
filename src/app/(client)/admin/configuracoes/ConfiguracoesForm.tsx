'use client'

import { useState, useEffect, useActionState, useTransition } from 'react'
import { upsertServico, deleteServico, updateDisponibilidades } from '@/lib/actions/admin'
import TemplateModal from './TemplateModal'

interface Servico {
  id: string
  nome: string
  descricao: string | null
  preco: number
  duracao_min: number
  ativo: boolean
  exige_formulario: boolean
  formulario_recorrencia: string
  formulario_template_id?: string
}

interface Disponibilidade {
  id: string
  dia_semana: number
  hora_inicio: string
  hora_fim: string
  ativo: boolean
}

interface Template {
  id: string
  nome: string
  descricao: string
  perguntas_json: string
}

const DIAS_SEMANA = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado'
]

export default function ConfiguracoesForm({
  initialServicos,
  initialDisponibilidades,
}: {
  initialServicos: Servico[]
  initialDisponibilidades: Disponibilidade[]
}) {
  const [servicos] = useState<Servico[]>(initialServicos)
  const [disponibilidades, setDisponibilidades] = useState<Disponibilidade[]>(() => {
    const list = [...initialDisponibilidades]
    for (let i = 0; i <= 6; i++) {
      if (!list.some(d => d.dia_semana === i)) {
        list.push({
          id: '',
          dia_semana: i,
          hora_inicio: '08:00',
          hora_fim: '18:00',
          ativo: i !== 0
        })
      }
    }
    return list.sort((a, b) => a.dia_semana - b.dia_semana)
  })

  const [editingServico, setEditingServico] = useState<Partial<Servico> | null>(null)
  const [showServicoForm, setShowServicoForm] = useState(false)
  const [exigeForm, setExigeForm] = useState(false)
  const [templates, setTemplates] = useState<Template[]>([])
  const [isTemplateModalOpen, setTemplateModalOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)

  useEffect(() => {
    const ctrl = new AbortController()
    fetch('/api/templates', { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => { if (!ctrl.signal.aborted) setTemplates(data) })
      .catch(() => {})
    return () => ctrl.abort()
  }, [])

  const [stateServico, actionServico, pendingServico] = useActionState(
    async (prevState: { error: string; success?: boolean } | undefined, formData: FormData) => {
      const res = await upsertServico(prevState, formData)
      if (res.success) {
        window.location.reload()
      }
      return res
    },
    undefined as { error: string; success?: boolean } | undefined
  )

  const [isPendingDisp, startTransition] = useTransition()
  const [isPendingDelete, startDeleteTransition] = useTransition()
  const [deleteError, setDeleteError] = useState('')
  const [dispError, setDispError] = useState('')
  const [dispSuccess, setDispSuccess] = useState(false)

  const handleEditServico = (s: Servico) => {
    setEditingServico(s)
    setExigeForm(s.exige_formulario)
    setShowServicoForm(true)
  }

  const handleNovoServico = () => {
    setEditingServico({
      id: '',
      nome: '',
      descricao: '',
      preco: 0,
      duracao_min: 30,
      ativo: true,
      exige_formulario: false,
      formulario_recorrencia: 'primeira_vez',
      formulario_template_id: ''
    })
    setExigeForm(false)
    setShowServicoForm(true)
  }

  const handleDeleteServico = (servicoId: string, nome: string) => {
    if (!confirm(`Tem certeza que deseja excluir o serviço "${nome}"?`)) return
    setDeleteError('')
    startDeleteTransition(async () => {
      const res = await deleteServico(servicoId)
      if (res.error) {
        setDeleteError(res.error)
      } else {
        window.location.reload()
      }
    })
  }

  const handleNovoTemplate = () => {
    setEditingTemplate(null)
    setTemplateModalOpen(true)
  }

  const handleEditTemplate = (t: Template) => {
    setEditingTemplate(t)
    setTemplateModalOpen(true)
  }

  const handleTemplateModalClose = () => {
    setTemplateModalOpen(false)
    setEditingTemplate(null)
    fetch('/api/templates')
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setTemplates(data))
      .catch(() => {})
  }

  const handleSaveDisponibilidades = async (e: React.FormEvent) => {
    e.preventDefault()
    setDispError('')
    setDispSuccess(false)
    startTransition(async () => {
      const res = await updateDisponibilidades(undefined, disponibilidades)
      if (res.error) {
        setDispError(res.error)
      } else {
        setDispSuccess(true)
      }
    })
  }

  const handleDispChange = (index: number, field: keyof Disponibilidade, value: boolean | string) => {
    const updated = [...disponibilidades]
    updated[index] = { ...updated[index], [field]: value }
    setDisponibilidades(updated)
  }

  function countPerguntas(json?: string): number {
    if (!json) return 0
    try {
      const arr = JSON.parse(json)
      return Array.isArray(arr) ? arr.length : 0
    } catch {
      return 0
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      {/* Services + Templates */}
      <div className="lg:col-span-2 space-y-6">
        {/* Serviços */}
        <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <h2 className="text-xl font-semibold text-zinc-800 font-serif">Serviços e Procedimentos</h2>
            <div className="flex gap-2">
              <button
                onClick={handleNovoServico}
                className="rounded-xl bg-[#C4917B] px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#A87060] active:scale-[0.98]"
              >
                Novo Serviço
              </button>
            </div>
          </div>

          {deleteError && (
            <div className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-600 border border-red-200 mb-4">
              {deleteError}
            </div>
          )}

          <div className="divide-y divide-zinc-100">
            {servicos.map(s => (
              <div key={s.id} className="py-4 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-zinc-800">{s.nome}</span>
                    {!s.ativo && (
                      <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs font-semibold text-zinc-500">Inativo</span>
                    )}
                    {s.exige_formulario && (
                      <span className="rounded bg-blue-50 px-1.5 py-0.5 text-xs font-semibold text-blue-600">
                        Ficha: {s.formulario_recorrencia === 'sempre' ? 'Sempre' : '1ª Vez'}
                      </span>
                    )}
                    {s.formulario_template_id && (
                      <span className="rounded bg-green-50 px-1.5 py-0.5 text-xs font-semibold text-green-600">
                        Modelo: {templates.find(t => t.id === s.formulario_template_id)?.nome || '...'}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-zinc-500">{s.descricao || 'Sem descrição.'}</p>
                  <div className="text-xs text-zinc-400">
                    Duração: {s.duracao_min} min | Valor: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(s.preco)}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => handleEditServico(s)}
                    className="text-sm font-medium text-[#C4917B] hover:underline"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeleteServico(s.id, s.nome)}
                    disabled={isPendingDelete}
                    className="text-sm font-medium text-red-500 hover:underline disabled:opacity-50"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modelos de Formulário */}
        <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div>
              <h2 className="text-xl font-semibold text-zinc-800 font-serif">Modelos de Formulário</h2>
              <p className="text-xs text-zinc-400 mt-1">Formulários de anamnese vinculados aos serviços.</p>
            </div>
            <button
              onClick={handleNovoTemplate}
              className="rounded-xl bg-[#C4917B] px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#A87060] active:scale-[0.98]"
            >
              Novo Modelo
            </button>
          </div>

          {templates.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-zinc-200 p-8 text-center">
              <p className="text-sm text-zinc-400">
                Nenhum modelo cadastrado. Clique em &quot;Novo Modelo&quot; para criar o primeiro.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100">
              {templates.map(t => (
                <div key={t.id} className="py-3 flex justify-between items-center gap-4">
                  <div className="min-w-0">
                    <p className="font-semibold text-zinc-800 text-sm">{t.nome}</p>
                    <p className="text-xs text-zinc-400 truncate">
                      {t.descricao || 'Sem descrição'} · {countPerguntas(t.perguntas_json)} pergunta{countPerguntas(t.perguntas_json) !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <button
                    onClick={() => handleEditTemplate(t)}
                    className="text-sm font-medium text-[#C4917B] hover:underline shrink-0"
                  >
                    Editar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Service Form */}
        {showServicoForm && editingServico && (
          <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-4">
            <h3 className="text-lg font-semibold text-zinc-800">
              {editingServico.id ? 'Editar Serviço' : 'Cadastrar Novo Serviço'}
            </h3>
            <form action={actionServico} className="space-y-4">
              <input type="hidden" name="id" value={editingServico.id || ''} />

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-zinc-700">Nome do Serviço *</label>
                  <input
                    type="text"
                    name="nome"
                    required
                    defaultValue={editingServico.nome || ''}
                    className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm text-zinc-800 shadow-[0_1px_3px_rgba(0,0,0,0.04)] focus:border-[#C4917B] focus:outline-none"
                    placeholder="Ex: Limpeza de Pele"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-zinc-700">Preço (R$) *</label>
                  <input
                    type="number"
                    name="preco"
                    step="0.01"
                    required
                    defaultValue={editingServico.preco || 0}
                    className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm text-zinc-800 shadow-[0_1px_3px_rgba(0,0,0,0.04)] focus:border-[#C4917B] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-zinc-700">Duração (minutos) *</label>
                  <input
                    type="number"
                    name="duracao_min"
                    required
                    defaultValue={editingServico.duracao_min || 30}
                    className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm text-zinc-800 shadow-[0_1px_3px_rgba(0,0,0,0.04)] focus:border-[#C4917B] focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="ativo"
                    name="ativo"
                    defaultChecked={editingServico.ativo ?? true}
                    className="rounded text-[#C4917B] focus:ring-[#C4917B]"
                  />
                  <label htmlFor="ativo" className="text-sm font-medium text-zinc-700">
                    Serviço Ativo (visível para agendamentos)
                  </label>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-zinc-700">Descrição</label>
                <textarea
                  name="descricao"
                  rows={2}
                  defaultValue={editingServico.descricao || ''}
                  className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm text-zinc-800 shadow-[0_1px_3px_rgba(0,0,0,0.04)] focus:border-[#C4917B] focus:outline-none resize-none"
                  placeholder="Explicação curta do serviço..."
                />
              </div>

              {/* Form requirement */}
              <div className="border border-zinc-100 rounded-2xl p-4 bg-zinc-50 space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="exige_formulario"
                    name="exige_formulario"
                    checked={exigeForm}
                    onChange={e => setExigeForm(e.target.checked)}
                    className="rounded text-[#C4917B] focus:ring-[#C4917B]"
                  />
                  <label htmlFor="exige_formulario" className="text-sm font-semibold text-zinc-800">
                    Exige preenchimento de Formulário Prévio (Anamnese)?
                  </label>
                </div>

                {exigeForm && (
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-zinc-500">Recorrência do Preenchimento</label>
                    <select
                      name="formulario_recorrencia"
                      defaultValue={editingServico.formulario_recorrencia || 'primeira_vez'}
                      className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm text-zinc-800 shadow-[0_1px_3px_rgba(0,0,0,0.04)] focus:border-[#C4917B] focus:outline-none"
                    >
                      <option value="primeira_vez">Apenas na primeira vez que o cliente for fazer o atendimento</option>
                      <option value="sempre">Todas as vezes (a cada novo agendamento)</option>
                    </select>
                  </div>
                )}

                {exigeForm && (
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-zinc-500">Modelo de Formulário</label>
                    <select
                      name="formulario_template_id"
                      defaultValue={editingServico.formulario_template_id || ''}
                      className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm text-zinc-800 shadow-[0_1px_3px_rgba(0,0,0,0.04)] focus:border-[#C4917B] focus:outline-none"
                    >
                      <option value="">Selecione um modelo</option>
                      {templates.map(t => (
                        <option key={t.id} value={t.id}>{t.nome}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {stateServico?.error && (
                <div className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-600 border border-red-200">
                  {stateServico.error}
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowServicoForm(false)}
                  className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition-all duration-200 hover:bg-zinc-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={pendingServico}
                  className="rounded-xl bg-[#C4917B] px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#A87060] active:scale-[0.98]"
                >
                  {pendingServico ? 'Salvando...' : 'Salvar Serviço'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Working Hours */}
      <div className="space-y-6">
        <form onSubmit={handleSaveDisponibilidades} className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-zinc-800 font-serif">Horário de Funcionamento</h2>
            <p className="text-xs text-zinc-400 mt-1">Defina os dias e horas de trabalho disponíveis para os clientes.</p>
          </div>

          <div className="space-y-4">
            {disponibilidades.map((d, index) => (
              <div key={d.dia_semana} className="flex flex-col gap-2 border-b border-zinc-50 pb-3 last:border-0 last:pb-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-zinc-700">{DIAS_SEMANA[d.dia_semana]}</span>
                  <input
                    type="checkbox"
                    checked={d.ativo}
                    onChange={e => handleDispChange(index, 'ativo', e.target.checked)}
                    className="rounded text-[#C4917B] focus:ring-[#C4917B]"
                  />
                </div>

                {d.ativo && (
                  <div className="flex gap-2 items-center">
                    <input
                      type="time"
                      value={d.hora_inicio.slice(0, 5)}
                      onChange={e => handleDispChange(index, 'hora_inicio', e.target.value)}
                      className="flex-1 rounded-xl border border-zinc-200 px-2 py-1 text-xs text-zinc-800 shadow-[0_1px_3px_rgba(0,0,0,0.04)] focus:border-[#C4917B] focus:outline-none"
                    />
                    <span className="text-xs text-zinc-400">às</span>
                    <input
                      type="time"
                      value={d.hora_fim.slice(0, 5)}
                      onChange={e => handleDispChange(index, 'hora_fim', e.target.value)}
                      className="flex-1 rounded-xl border border-zinc-200 px-2 py-1 text-xs text-zinc-800 shadow-[0_1px_3px_rgba(0,0,0,0.04)] focus:border-[#C4917B] focus:outline-none"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {dispError && (
            <div className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-600 border border-red-200">
              {dispError}
            </div>
          )}

          {dispSuccess && (
            <div className="rounded-xl bg-green-50 px-4 py-2 text-sm text-green-700 border border-green-200">
              Horários de funcionamento atualizados com sucesso!
            </div>
          )}

          <button
            type="submit"
            disabled={isPendingDisp}
            className="w-full rounded-xl bg-[#C4917B] py-2.5 text-sm font-semibold text-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all duration-200 hover:bg-[#A87060] active:scale-[0.98] disabled:opacity-50"
          >
            {isPendingDisp ? 'Atualizando...' : 'Atualizar Horários'}
          </button>
        </form>
      </div>

      {/* Template Modal */}
      <TemplateModal
        key={editingTemplate?.id || 'new'}
        isOpen={isTemplateModalOpen}
        onClose={handleTemplateModalClose}
        editingTemplate={editingTemplate}
      />
    </div>
  )
}
