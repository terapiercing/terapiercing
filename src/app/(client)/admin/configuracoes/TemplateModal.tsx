'use client'

import { useState, useActionState } from 'react'
import { createTemplate, updateTemplate, deleteTemplate } from '@/lib/actions/admin'

type FieldType = 'text' | 'textarea' | 'date' | 'checkbox' | 'select' | 'number' | 'file' | 'multiselect'

interface Pergunta {
  id: string
  label: string
  type: FieldType
  required: boolean
  options: string[]
}

interface TemplateData {
  id: string
  nome: string
  descricao: string
  perguntas_json: string
}

const FIELD_TYPES: { value: FieldType; label: string }[] = [
  { value: 'text', label: 'Texto' },
  { value: 'textarea', label: 'Texto Longo' },
  { value: 'date', label: 'Data' },
  { value: 'checkbox', label: 'Sim/Não' },
  { value: 'select', label: 'Seleção (dropdown)' },
  { value: 'multiselect', label: 'Múltipla Escolha' },
  { value: 'number', label: 'Numérico' },
  { value: 'file', label: 'Arquivo / Foto' },
]

function generateId() {
  return Math.random().toString(36).substring(2, 10)
}

function parsePerguntas(json: string): Pergunta[] {
  try {
    const arr = JSON.parse(json)
    if (!Array.isArray(arr)) return []
    return arr.map((p: Record<string, unknown>) => ({
      id: (p.id as string) || generateId(),
      label: (p.label as string) || '',
      type: (p.type as FieldType) || 'text',
      required: !!p.required,
      options: Array.isArray(p.options) ? (p.options as string[]) : [],
    }))
  } catch {
    return []
  }
}

function serializePerguntas(perguntas: Pergunta[]): string {
  return JSON.stringify(
    perguntas.map((p) => ({
      id: p.id,
      label: p.label,
      type: p.type,
      required: p.required,
      options: ['select', 'multiselect'].includes(p.type) ? p.options : [],
    })),
    null,
    2
  )
}

export default function TemplateModal({
  isOpen,
  onClose,
  editingTemplate,
}: {
  isOpen: boolean
  onClose: () => void
  editingTemplate?: TemplateData | null
}) {
  const [nome, setNome] = useState(editingTemplate?.nome || '')
  const [descricao, setDescricao] = useState(editingTemplate?.descricao || '')
  const [perguntas, setPerguntas] = useState<Pergunta[]>(() =>
    editingTemplate ? parsePerguntas(editingTemplate.perguntas_json) : []
  )

  const [state, action, pending] = useActionState(
    async (prev: { error?: string; success?: boolean } | undefined, formData: FormData) => {
      formData.set('perguntas_json', serializePerguntas(perguntas))
      const isEdit = !!formData.get('id')
      const res = isEdit
        ? await updateTemplate(prev, formData)
        : await createTemplate(prev, formData)
      if (res?.success) onClose()
      return res
    },
    undefined as { error?: string; success?: boolean } | undefined
  )

  const handleDelete = async () => {
    if (!editingTemplate?.id) return
    const fd = new FormData()
    fd.append('id', editingTemplate.id)
    const res = await deleteTemplate(undefined, fd)
    if (res?.success) onClose()
  }

  const addPergunta = () => {
    setPerguntas((prev) => [
      ...prev,
      { id: generateId(), label: '', type: 'text', required: false, options: [] },
    ])
  }

  const updatePergunta = (id: string, field: keyof Pergunta, value: unknown) => {
    setPerguntas((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p
        const updated = { ...p, [field]: value }
        if (field === 'type') {
          const needsOptions = ['select', 'multiselect'].includes(value as FieldType)
          if (!needsOptions) updated.options = []
          else if (updated.options.length === 0) updated.options = ['']
        }
        return updated
      })
    )
  }

  const removePergunta = (id: string) => {
    setPerguntas((prev) => prev.filter((p) => p.id !== id))
  }

  const movePergunta = (id: string, direction: -1 | 1) => {
    setPerguntas((prev) => {
      const idx = prev.findIndex((p) => p.id === id)
      if (idx < 0) return prev
      const newIdx = idx + direction
      if (newIdx < 0 || newIdx >= prev.length) return prev
      const next = [...prev]
      ;[next[idx], next[newIdx]] = [next[newIdx], next[idx]]
      return next
    })
  }

  const addOption = (id: string) => {
    setPerguntas((prev) =>
      prev.map((p) => (p.id === id ? { ...p, options: [...p.options, ''] } : p))
    )
  }

  const updateOption = (perguntaId: string, optIndex: number, value: string) => {
    setPerguntas((prev) =>
      prev.map((p) => {
        if (p.id !== perguntaId) return p
        const opts = [...p.options]
        opts[optIndex] = value
        return { ...p, options: opts }
      })
    )
  }

  const removeOption = (perguntaId: string, optIndex: number) => {
    setPerguntas((prev) =>
      prev.map((p) => {
        if (p.id !== perguntaId) return p
        return { ...p, options: p.options.filter((_, i) => i !== optIndex) }
      })
    )
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">
      <div
        className="w-full max-w-3xl max-h-[90vh] flex flex-col bg-white rounded-3xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 shrink-0">
          <h2 className="text-lg font-semibold text-zinc-800">
            {editingTemplate ? 'Editar Modelo de Formulário' : 'Novo Modelo de Formulário'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 text-xl leading-none"
          >
            &times;
          </button>
        </div>

        {/* Body */}
        <form action={action} className="flex flex-col flex-1 min-h-0">
          {editingTemplate && <input type="hidden" name="id" value={editingTemplate.id} />}

          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
            {/* Nome */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Nome do Modelo *
              </label>
              <input
                type="text"
                name="nome"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm text-zinc-800 transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/15 focus:outline-none"
                placeholder="Ex: Ficha de Anamnese - Limpeza de Pele"
              />
            </div>

            {/* Descrição */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Descrição</label>
              <textarea
                name="descricao"
                rows={2}
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm text-zinc-800 transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/15 focus:outline-none resize-none"
                placeholder="Descreva o propósito deste formulário..."
              />
            </div>

            {/* Perguntas */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-zinc-700">
                  Perguntas ({perguntas.length})
                </h3>
                <button
                  type="button"
                  onClick={addPergunta}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-dark transition-all duration-200 active:scale-[0.98]"
                >
                  <span className="text-base leading-none">+</span> Adicionar Pergunta
                </button>
              </div>

              {perguntas.length === 0 && (
                <div className="rounded-xl border-2 border-dashed border-zinc-200 p-8 text-center">
                  <p className="text-sm text-zinc-400">
                    Nenhuma pergunta adicionada. Clique em &quot;Adicionar Pergunta&quot; para começar.
                  </p>
                </div>
              )}

              <div className="space-y-3">
                {perguntas.map((pergunta, index) => (
                  <div
                    key={pergunta.id}
                    className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 space-y-3"
                  >
                    {/* Pergunta header */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-zinc-400 w-6 text-center">
                        {index + 1}
                      </span>
                      <input
                        type="text"
                        value={pergunta.label}
                        onChange={(e) => updatePergunta(pergunta.id, 'label', e.target.value)}
                        placeholder="Texto da pergunta..."
                        className="flex-1 rounded-xl border border-zinc-200 px-3 py-2 text-sm text-zinc-800 bg-white transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/15 focus:outline-none"
                      />
                      <label className="flex items-center gap-1.5 text-xs text-zinc-500 shrink-0">
                        <input
                          type="checkbox"
                          checked={pergunta.required}
                          onChange={(e) => updatePergunta(pergunta.id, 'required', e.target.checked)}
                          className="rounded text-primary focus:ring-primary"
                        />
                        Obrigatório
                      </label>
                    </div>

                    {/* Tipo + Ações */}
                    <div className="flex items-center gap-2">
                      <select
                        value={pergunta.type}
                        onChange={(e) => updatePergunta(pergunta.id, 'type', e.target.value as FieldType)}
                        className="rounded-xl border border-zinc-200 px-3 py-1.5 text-xs text-zinc-700 bg-white transition-all duration-200 focus:border-primary focus:outline-none"
                      >
                        {FIELD_TYPES.map((ft) => (
                          <option key={ft.value} value={ft.value}>
                            {ft.label}
                          </option>
                        ))}
                      </select>

                      <div className="flex-1" />

                      <button
                        type="button"
                        onClick={() => movePergunta(pergunta.id, -1)}
                        disabled={index === 0}
                        className="text-zinc-400 hover:text-zinc-600 disabled:opacity-30 text-sm"
                        title="Mover para cima"
                      >
                        &#9650;
                      </button>
                      <button
                        type="button"
                        onClick={() => movePergunta(pergunta.id, 1)}
                        disabled={index === perguntas.length - 1}
                        className="text-zinc-400 hover:text-zinc-600 disabled:opacity-30 text-sm"
                        title="Mover para baixo"
                      >
                        &#9660;
                      </button>
                      <button
                        type="button"
                        onClick={() => removePergunta(pergunta.id)}
                        className="text-red-400 hover:text-red-600 text-sm font-bold"
                        title="Remover pergunta"
                      >
                        &times;
                      </button>
                    </div>

                    {/* Opções para select/multiselect */}
                    {['select', 'multiselect'].includes(pergunta.type) && (
                      <div className="space-y-2 pl-6">
                        <p className="text-xs text-zinc-500 font-medium">Opções:</p>
                        {pergunta.options.map((opt, optIdx) => (
                          <div key={optIdx} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) => updateOption(pergunta.id, optIdx, e.target.value)}
                              placeholder={`Opção ${optIdx + 1}`}
                              className="flex-1 rounded-xl border border-zinc-200 px-3 py-1.5 text-xs text-zinc-800 bg-white transition-all duration-200 focus:border-primary focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => removeOption(pergunta.id, optIdx)}
                              className="text-red-400 hover:text-red-600 text-xs"
                            >
                              &times;
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => addOption(pergunta.id)}
                          className="text-xs font-medium text-primary hover:underline"
                        >
                          + Adicionar opção
                        </button>
                      </div>
                    )}

                    {/* Preview do campo */}
                    <div className="pl-6">
                      <p className="text-[10px] text-zinc-400 mb-1">Preview:</p>
                      {pergunta.type === 'text' && (
                        <input type="text" disabled placeholder="Campo de texto..." className="w-full rounded-lg border border-zinc-200 px-3 py-1.5 text-xs text-zinc-400 bg-white" />
                      )}
                      {pergunta.type === 'textarea' && (
                        <textarea disabled rows={2} placeholder="Campo de texto longo..." className="w-full rounded-lg border border-zinc-200 px-3 py-1.5 text-xs text-zinc-400 bg-white resize-none" />
                      )}
                      {pergunta.type === 'date' && (
                        <input type="date" disabled className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs text-zinc-400 bg-white" />
                      )}
                      {pergunta.type === 'number' && (
                        <input type="number" disabled placeholder="0" className="w-32 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs text-zinc-400 bg-white" />
                      )}
                      {pergunta.type === 'checkbox' && (
                        <label className="flex items-center gap-2 text-xs text-zinc-500">
                          <input type="checkbox" disabled className="rounded" />
                          Sim
                        </label>
                      )}
                      {pergunta.type === 'select' && (
                        <select disabled className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs text-zinc-400 bg-white">
                          <option>Selecione...</option>
                          {pergunta.options.map((o, i) => (
                            <option key={i}>{o || `Opção ${i + 1}`}</option>
                          ))}
                        </select>
                      )}
                      {pergunta.type === 'multiselect' && (
                        <div className="space-y-1">
                          {pergunta.options.map((o, i) => (
                            <label key={i} className="flex items-center gap-2 text-xs text-zinc-500">
                              <input type="checkbox" disabled className="rounded" />
                              {o || `Opção ${i + 1}`}
                            </label>
                          ))}
                        </div>
                      )}
                      {pergunta.type === 'file' && (
                        <div className="rounded-lg border-2 border-dashed border-zinc-200 px-3 py-3 text-center text-xs text-zinc-400">
                          Clique para selecionar arquivo
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-zinc-200 px-6 py-4 flex items-center justify-between shrink-0">
            <div>
              {editingTemplate && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={pending}
                  className="rounded-xl border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-all duration-200 disabled:opacity-50"
                >
                  Excluir Modelo
                </button>
              )}
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={pending}
                className="rounded-xl border border-zinc-200 bg-white px-5 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-all duration-200 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={pending || perguntas.length === 0}
                className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark transition-all duration-200 active:scale-[0.98] disabled:opacity-50"
              >
                {pending ? 'Salvando...' : 'Salvar Modelo'}
              </button>
            </div>
          </div>

          {state?.error && (
            <div className="mx-6 mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600 border border-red-200">
              {state.error}
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
