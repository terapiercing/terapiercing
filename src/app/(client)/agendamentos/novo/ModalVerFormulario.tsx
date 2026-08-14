'use client'

import { useMemo, useState } from 'react'
import { updateAnamnese } from '@/lib/actions/appointments'

interface Pergunta {
  id: string
  label: string
  type: string
  required: boolean
  options?: string[]
}

interface AnamneseData {
  id: string
  formulario_template_id: string | null
  campos_json: Record<string, unknown> | null
  aceite_digital: boolean | null
  aceito_em: string | null
  formulario_templates: { nome: string; perguntas_json: string } | null
}

interface AppointmentView {
  id: string
  data: string
  hora: string
  servicos: { nome: string; duracao_min: number; preco: number } | null
  usuarios: { nome: string; email: string; telefone: string } | null
  anamneses: AnamneseData[] | null
}

const formatValue = (value: unknown): string => {
  if (value === null || value === undefined || value === '') return '—'
  if (typeof value === 'boolean') return value ? 'Sim' : 'Não'
  if (Array.isArray(value)) return value.length > 0 ? value.join(', ') : '—'
  return String(value)
}

const INPUT_CLASSES =
  'w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-800 shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/15 focus:outline-none transition-all duration-200'

export default function ModalVerFormulario({
  appointment,
  onClose,
  onSaved,
}: {
  appointment: AppointmentView
  onClose: () => void
  onSaved?: (appointmentId: string) => void
}) {
  const anamnese = appointment.anamneses && appointment.anamneses.length > 0 ? appointment.anamneses[0] : null

  const perguntas: Pergunta[] = useMemo(() => {
    if (!anamnese?.formulario_templates?.perguntas_json) return []
    try {
      const parsed = JSON.parse(anamnese.formulario_templates.perguntas_json)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }, [anamnese])

  const campos = anamnese?.campos_json || {}
  const assinatura = typeof campos._assinatura === 'string' ? campos._assinatura : null

  const [isEditing, setIsEditing] = useState(false)
  const [edited, setEdited] = useState<Record<string, unknown>>({})
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  const startEdit = () => {
    const initial: Record<string, unknown> = {}
    for (const p of perguntas) {
      initial[p.id] = campos[p.id] ?? (p.type === 'checkbox' ? false : p.type === 'multiselect' ? [] : '')
    }
    setEdited(initial)
    setSaveError('')
    setIsEditing(true)
  }

  const updateField = (perguntaId: string, value: unknown) => {
    setEdited((prev) => ({ ...prev, [perguntaId]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    setSaveError('')
    const result = await updateAnamnese(appointment.id, edited)
    setSaving(false)
    if (result.error) {
      setSaveError(result.error)
      return
    }
    setIsEditing(false)
    onSaved?.(appointment.id)
  }

  const renderEditField = (pergunta: Pergunta) => {
    const value = edited[pergunta.id]

    switch (pergunta.type) {
      case 'textarea':
        return (
          <textarea
            rows={3}
            value={(value as string) || ''}
            onChange={(e) => updateField(pergunta.id, e.target.value)}
            className={`${INPUT_CLASSES} resize-none`}
          />
        )
      case 'date':
        return (
          <input
            type="date"
            value={(value as string) || ''}
            onChange={(e) => updateField(pergunta.id, e.target.value)}
            className={INPUT_CLASSES}
          />
        )
      case 'number':
        return (
          <input
            type="number"
            value={(value as number) ?? ''}
            onChange={(e) => updateField(pergunta.id, e.target.value ? Number(e.target.value) : '')}
            className={INPUT_CLASSES}
          />
        )
      case 'checkbox':
        return (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={!!value}
              onChange={(e) => updateField(pergunta.id, e.target.checked)}
              className="rounded text-primary focus:ring-primary"
            />
            <span className="text-sm text-zinc-700">Sim</span>
          </label>
        )
      case 'select':
        return (
          <select
            value={(value as string) || ''}
            onChange={(e) => updateField(pergunta.id, e.target.value)}
            className={INPUT_CLASSES}
          >
            <option value="">Selecione...</option>
            {pergunta.options?.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        )
      case 'multiselect':
        return (
          <div className="space-y-2">
            {pergunta.options?.map((opt) => {
              const selected = Array.isArray(value) ? (value as string[]).includes(opt) : false
              return (
                <label key={opt} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => {
                      const current = Array.isArray(value) ? [...(value as string[])] : []
                      if (selected) {
                        updateField(pergunta.id, current.filter((v) => v !== opt))
                      } else {
                        updateField(pergunta.id, [...current, opt])
                      }
                    }}
                    className="rounded text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-zinc-700">{opt}</span>
                </label>
              )
            })}
          </div>
        )
      default:
        return (
          <input
            type="text"
            value={(value as string) || ''}
            onChange={(e) => updateField(pergunta.id, e.target.value)}
            className={INPUT_CLASSES}
          />
        )
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-3 sm:p-4">
      <div className="w-full max-w-full sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-white shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-zinc-100 bg-white px-4 py-3 sm:px-6 sm:py-4 rounded-t-3xl">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-semibold text-zinc-800 truncate">
                Ficha de Anamnese
              </h3>
              <p className="text-xs text-zinc-500 truncate">
                {appointment.usuarios?.nome || 'Cliente'} · {appointment.servicos?.nome || 'Serviço'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="shrink-0 min-h-[44px] min-w-[44px] rounded-xl text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-all duration-200 active:scale-[0.98]"
              aria-label="Fechar"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6">
          {!anamnese ? (
            <div className="rounded-2xl border border-dashed border-zinc-200 p-8 text-center">
              <p className="text-3xl mb-2">📋</p>
              <p className="text-sm text-zinc-500">
                Nenhum formulário preenchido para este agendamento.
              </p>
              <p className="text-xs text-zinc-400 mt-1">
                O cliente não preencheu a ficha de anamnese.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Dados do agendamento */}
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 space-y-1">
                <p className="text-sm font-medium text-zinc-800">
                  {new Date(appointment.data + 'T00:00:00').toLocaleDateString('pt-BR', {
                    weekday: 'long',
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                  {' às '}
                  {appointment.hora.slice(0, 5)}
                </p>
                {appointment.usuarios && (
                  <p className="text-sm text-zinc-600">
                    {appointment.usuarios.nome}
                    {appointment.usuarios.telefone && (
                      <span className="text-zinc-400 ml-1">· {appointment.usuarios.telefone}</span>
                    )}
                  </p>
                )}
                {anamnese.formulario_templates && (
                  <p className="text-xs text-zinc-500">
                    Modelo: {anamnese.formulario_templates.nome}
                  </p>
                )}
              </div>

              {/* Modo edição: botão Editar */}
              {!isEditing && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={startEdit}
                    className="rounded-xl border border-primary/30 bg-white px-4 py-2 text-xs font-semibold text-primary shadow-sm transition-all duration-200 hover:bg-primary/10 active:scale-[0.98]"
                  >
                    ✏️ Editar campos
                  </button>
                </div>
              )}

              {/* Perguntas e respostas */}
              {perguntas.length > 0 ? (
                <div className="space-y-4">
                  {perguntas.map((pergunta, index) => (
                    <div key={pergunta.id} className="rounded-2xl border border-zinc-100 p-4">
                      <p className="text-sm font-medium text-zinc-700">
                        <span className="text-zinc-400 mr-1">{index + 1}.</span>
                        {pergunta.label}
                        {isEditing && <span className="text-red-400 ml-1">*</span>}
                      </p>
                      {isEditing ? (
                        <div className="mt-2">{renderEditField(pergunta)}</div>
                      ) : (
                        <p className="mt-1.5 text-sm text-zinc-900 whitespace-pre-wrap break-words">
                          {formatValue(campos[pergunta.id])}
                        </p>
                      )}
                    </div>
                  ))}

                  {/* Outras respostas que não estão no template (ex: anamnese antiga) */}
                  {!isEditing &&
                    Object.entries(campos)
                      .filter(([key]) => !key.startsWith('_') && !perguntas.some((p) => p.id === key))
                      .map(([key, value]) => (
                        <div key={key} className="rounded-2xl border border-zinc-100 p-4">
                          <p className="text-sm font-medium text-zinc-700">{key}</p>
                          <p className="mt-1.5 text-sm text-zinc-900 whitespace-pre-wrap break-words">
                            {formatValue(value)}
                          </p>
                        </div>
                      ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-zinc-200 p-6">
                  <p className="text-sm text-zinc-500">Respostas registradas:</p>
                  <div className="mt-3 space-y-3">
                    {Object.entries(campos)
                      .filter(([key]) => !key.startsWith('_'))
                      .map(([key, value]) => (
                        <div key={key} className="rounded-xl border border-zinc-100 p-3">
                          <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide">{key}</p>
                          <p className="mt-1 text-sm text-zinc-900 whitespace-pre-wrap break-words">
                            {formatValue(value)}
                          </p>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {saveError && (
                <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 border border-red-200">
                  {saveError}
                </div>
              )}

              {/* Assinatura */}
              {assinatura && (
                <div className="rounded-2xl border border-zinc-100 p-4 space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Assinatura Digital
                  </p>
                  <img
                    src={assinatura}
                    alt="Assinatura do cliente"
                    className="max-h-24 w-auto mx-auto"
                  />
                </div>
              )}

              {/* Aceite */}
              {anamnese.aceito_em && (
                <p className="text-xs text-zinc-400 text-center">
                  Assinado em {new Date(anamnese.aceito_em).toLocaleString('pt-BR')}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 border-t border-zinc-100 bg-white px-4 py-3 sm:px-6 sm:py-4 rounded-b-3xl">
          {isEditing ? (
            <div className="flex gap-3">
              <button
                onClick={() => setIsEditing(false)}
                disabled={saving}
                className="flex-1 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 shadow-sm transition-all duration-200 hover:bg-zinc-50 active:scale-[0.98] disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-[2] rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-primary-dark active:scale-[0.98] disabled:opacity-50"
              >
                {saving ? 'Salvando...' : 'Salvar alterações'}
              </button>
            </div>
          ) : (
            <button
              onClick={onClose}
              className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-primary-dark active:scale-[0.98]"
            >
              Fechar
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
