'use client'

import { useEffect, useState } from 'react'
import SignaturePad from './novo/SignaturePad'
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
  servicos: { nome: string; preco: number } | null
  anamneses: AnamneseData[] | null
}

const INPUT_CLASSES =
  'w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-800 shadow-sm focus:border-[#C4917B] focus:ring-2 focus:ring-[#C4917B]/15 focus:outline-none transition-all duration-200'

const isBlankImage = (dataUrl: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      if (!ctx) return resolve(true)
      ctx.drawImage(img, 0, 0)
      try {
        const { data } = ctx.getImageData(0, 0, img.width, img.height)
        for (let i = 0; i < data.length; i += 4) {
          if (data[i] < 240 || data[i + 1] < 240 || data[i + 2] < 240) {
            return resolve(false)
          }
        }
        resolve(true)
      } catch {
        resolve(true)
      }
    }
    img.onerror = () => resolve(true)
    img.src = dataUrl
  })
}

export default function ModalEditarFormulario({
  appointment,
  onClose,
  onSaved,
}: {
  appointment: AppointmentView
  onClose: () => void
  onSaved?: () => void
}) {
  const anamnese =
    appointment.anamneses && appointment.anamneses.length > 0
      ? appointment.anamneses[0]
      : null

  const perguntas: Pergunta[] = (() => {
    if (!anamnese?.formulario_templates?.perguntas_json) return []
    try {
      const parsed = JSON.parse(anamnese.formulario_templates.perguntas_json)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  })()

  const campos = anamnese?.campos_json || {}
  const assinaturaOriginal =
    typeof campos._assinatura === 'string' ? campos._assinatura : null

  const [form, setForm] = useState<Record<string, unknown>>(() => {
    const initial: Record<string, unknown> = {}
    for (const p of perguntas) {
      initial[p.id] =
        campos[p.id] ?? (p.type === 'checkbox' ? false : p.type === 'multiselect' ? [] : '')
    }
    return initial
  })
  const [novaAssinatura, setNovaAssinatura] = useState<string | null>(null)
  const [originalBlank, setOriginalBlank] = useState(false)
  const [aceite, setAceite] = useState(!!anamnese?.aceite_digital)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  useEffect(() => {
    if (assinaturaOriginal) {
      let cancelled = false
      isBlankImage(assinaturaOriginal).then((blank) => {
        if (!cancelled) setOriginalBlank(blank)
      })
      return () => {
        cancelled = true
      }
    }
  }, [assinaturaOriginal])

  const updateField = (perguntaId: string, value: unknown) => {
    setForm((prev) => ({ ...prev, [perguntaId]: value }))
  }

  const hasValidSignature =
    novaAssinatura !== null || (assinaturaOriginal !== null && !originalBlank)

  const canSave = perguntas.every((p) => {
    if (!p.required) return true
    const val = form[p.id]
    if (val === undefined || val === null || val === '') return false
    if (Array.isArray(val) && val.length === 0) return false
    return true
  }) && hasValidSignature && aceite && !saving

  const handleSave = async () => {
    setSaving(true)
    setSaveError('')
    const payload: Record<string, unknown> = { ...form }
    const reassign = novaAssinatura !== null
    if (reassign) payload._assinatura = novaAssinatura
    const result = await updateAnamnese(appointment.id, payload, {
      onlyPending: true,
      reassign,
    })
    setSaving(false)
    if (result.error) {
      setSaveError(result.error)
      return
    }
    onSaved?.()
  }

  const renderField = (pergunta: Pergunta) => {
    const value = form[pergunta.id]

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
            onChange={(e) =>
              updateField(pergunta.id, e.target.value ? Number(e.target.value) : '')
            }
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
              className="rounded text-[#C4917B] focus:ring-[#C4917B]"
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
              const selected = Array.isArray(value)
                ? (value as string[]).includes(opt)
                : false
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
                    className="rounded text-[#C4917B] focus:ring-[#C4917B]"
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

  const extraCampos = Object.entries(campos).filter(
    ([key]) => !key.startsWith('_') && !perguntas.some((p) => p.id === key)
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-3 sm:p-4">
      <div className="w-full max-w-full sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-white shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-zinc-100 bg-white px-4 py-3 sm:px-6 sm:py-4 rounded-t-3xl">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-semibold text-zinc-800 truncate">
                Revisar Ficha de Anamnese
              </h3>
              <p className="text-xs text-zinc-500 truncate">
                {appointment.servicos?.nome || 'Serviço'} ·{' '}
                {new Date(appointment.data + 'T00:00:00').toLocaleDateString('pt-BR')} às{' '}
                {appointment.hora.slice(0, 5)}
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
        <div className="p-4 sm:p-6 space-y-5">
          {!anamnese ? (
            <div className="rounded-2xl border border-dashed border-zinc-200 p-8 text-center">
              <p className="text-3xl mb-2">📋</p>
              <p className="text-sm text-zinc-500">
                Nenhum formulário preenchido para este agendamento.
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-700">
                Este formulário pode ser editado enquanto o agendamento estiver com
                status Pendente.
              </div>

              {perguntas.length > 0 ? (
                <div className="space-y-4">
                  {perguntas.map((pergunta, index) => (
                    <div key={pergunta.id} className="rounded-2xl border border-zinc-100 p-4">
                      <p className="text-sm font-medium text-zinc-700">
                        <span className="text-zinc-400 mr-1">{index + 1}.</span>
                        {pergunta.label}
                        {pergunta.required && <span className="text-red-400 ml-1">*</span>}
                      </p>
                      <div className="mt-2">{renderField(pergunta)}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-zinc-200 p-6">
                  <p className="text-sm text-zinc-500">Sem perguntas no modelo.</p>
                </div>
              )}

              {extraCampos.length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Outras informações registradas
                  </p>
                  {extraCampos.map(([key, value]) => (
                    <div key={key} className="rounded-xl border border-zinc-100 p-3">
                      <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide">
                        {key}
                      </p>
                      <p className="mt-1 text-sm text-zinc-900 whitespace-pre-wrap break-words">
                        {typeof value === 'boolean'
                          ? value
                            ? 'Sim'
                            : 'Não'
                          : String(value ?? '—')}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {saveError && (
                <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 border border-red-200">
                  {saveError}
                </div>
              )}

              {/* Assinatura */}
              <div className="space-y-3 rounded-2xl border border-zinc-100 p-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Assinatura Digital
                  </p>
                  {originalBlank ? (
                    <div className="mt-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                      A assinatura salva está em branco. Assine novamente abaixo para
                      registrar sua assinatura.
                    </div>
                  ) : novaAssinatura !== null ? (
                    <div className="mt-2 rounded-xl border border-zinc-100 p-3">
                      <img
                        src={novaAssinatura}
                        alt="Nova assinatura"
                        className="max-h-24 w-auto mx-auto"
                      />
                      <p className="mt-2 text-center text-xs text-emerald-600">
                        Nova assinatura registrada — substituirá a anterior ao salvar.
                      </p>
                    </div>
                  ) : assinaturaOriginal ? (
                    <div className="mt-2 rounded-xl border border-zinc-100 p-3">
                      <img
                        src={assinaturaOriginal}
                        alt="Assinatura salva"
                        className="max-h-24 w-auto mx-auto"
                      />
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-zinc-500">
                      Nenhuma assinatura registrada. Assine abaixo.
                    </p>
                  )}
                </div>

                <div>
                  <p className="text-sm font-semibold text-zinc-700 mb-2">
                    {assinaturaOriginal && !originalBlank
                      ? 'Assinar novamente (opcional)'
                      : 'Assinatura Digital *'}
                  </p>
                  <SignaturePad
                    onSign={(dataUrl) => setNovaAssinatura(dataUrl)}
                    onClear={() => setNovaAssinatura(null)}
                  />
                </div>
              </div>

              {/* Aceite */}
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={aceite}
                  onChange={(e) => setAceite(e.target.checked)}
                  className="mt-0.5 rounded text-[#C4917B] focus:ring-[#C4917B]"
                />
                <span className="text-sm text-zinc-600 leading-relaxed">
                  Reconfirmo que as informações acima estão corretas e autorizo o
                  procedimento.
                </span>
              </label>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 border-t border-zinc-100 bg-white px-4 py-3 sm:px-6 sm:py-4 rounded-b-3xl">
          {anamnese ? (
            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={saving}
                className="flex-1 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 shadow-sm transition-all duration-200 hover:bg-zinc-50 active:scale-[0.98] disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={!canSave}
                className="flex-[2] rounded-xl bg-[#C4917B] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#A87060] active:scale-[0.98] disabled:opacity-50"
              >
                {saving ? 'Salvando...' : 'Salvar alterações'}
              </button>
            </div>
          ) : (
            <button
              onClick={onClose}
              className="w-full rounded-xl bg-[#C4917B] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#A87060] active:scale-[0.98]"
            >
              Fechar
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
