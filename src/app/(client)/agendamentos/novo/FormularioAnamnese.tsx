'use client'

import { useState, useEffect } from 'react'
import SignaturePad from './SignaturePad'

type FieldType = 'text' | 'textarea' | 'date' | 'checkbox' | 'select' | 'multiselect' | 'number' | 'file'

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

export default function FormularioAnamnese({
  templateId,
  onComplete,
  onCancel,
}: {
  templateId: string
  onComplete: (respostas: Record<string, unknown>, assinatura: string) => void
  onCancel: () => void
}) {
  const [template, setTemplate] = useState<TemplateData | null>(null)
  const [perguntas, setPerguntas] = useState<Pergunta[]>([])
  const [respostas, setRespostas] = useState<Record<string, unknown>>({})
  const [assinatura, setAssinatura] = useState<string | null>(null)
  const [aceite, setAceite] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchTemplate() {
      try {
        const res = await fetch('/api/templates')
        const data = await res.json()
        const found = data.find((t: TemplateData) => t.id === templateId)
        if (found) {
          setTemplate(found)
          try {
            const parsed = JSON.parse(found.perguntas_json)
            setPerguntas(Array.isArray(parsed) ? parsed : [])
          } catch {
            setPerguntas([])
          }
        } else {
          setError('Modelo de formulário não encontrado.')
        }
      } catch {
        setError('Erro ao carregar formulário.')
      } finally {
        setLoading(false)
      }
    }
    fetchTemplate()
  }, [templateId])

  const updateResposta = (perguntaId: string, value: unknown) => {
    setRespostas((prev) => ({ ...prev, [perguntaId]: value }))
  }

  const allRequiredAnswered = perguntas
    .filter((p) => p.required)
    .every((p) => {
      const val = respostas[p.id]
      if (val === undefined || val === null || val === '') return false
      if (Array.isArray(val) && val.length === 0) return false
      return true
    })

  const canSubmit = allRequiredAnswered && !!assinatura && aceite

  const handleSubmit = () => {
    if (!canSubmit) return
    onComplete(respostas, assinatura!)
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-center">
        <p className="text-sm text-zinc-400">Carregando formulário...</p>
      </div>
    )
  }

  if (error || !template) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-sm text-red-600">{error || 'Formulário não encontrado.'}</p>
        <button
          type="button"
          onClick={onCancel}
          className="mt-3 text-sm font-medium text-primary hover:underline"
        >
          Voltar
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6 rounded-2xl border border-zinc-200 bg-white p-4 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">Ficha de Anamnese</p>
        <h3 className="text-lg font-semibold text-zinc-800 mt-1">{template.nome}</h3>
        {template.descricao && (
          <p className="text-sm text-zinc-500 mt-1">{template.descricao}</p>
        )}
      </div>

      <div className="space-y-5">
        {perguntas.map((pergunta, index) => {
          const value = respostas[pergunta.id]

          return (
            <div key={pergunta.id} className="space-y-2">
              <label className="block text-sm font-medium text-zinc-700">
                <span className="text-zinc-400 mr-1">{index + 1}.</span>
                {pergunta.label}
                {pergunta.required && <span className="text-red-400 ml-1">*</span>}
              </label>

              {pergunta.type === 'text' && (
                <input
                  type="text"
                  value={(value as string) || ''}
                  onChange={(e) => updateResposta(pergunta.id, e.target.value)}
                  required={pergunta.required}
                  className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm text-zinc-800 shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/15 focus:outline-none transition-all duration-200"
                />
              )}

              {pergunta.type === 'textarea' && (
                <textarea
                  rows={3}
                  value={(value as string) || ''}
                  onChange={(e) => updateResposta(pergunta.id, e.target.value)}
                  required={pergunta.required}
                  className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm text-zinc-800 shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/15 focus:outline-none transition-all duration-200 resize-none"
                />
              )}

              {pergunta.type === 'date' && (
                <input
                  type="date"
                  value={(value as string) || ''}
                  onChange={(e) => updateResposta(pergunta.id, e.target.value)}
                  required={pergunta.required}
                  className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm text-zinc-800 shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/15 focus:outline-none transition-all duration-200"
                />
              )}

              {pergunta.type === 'number' && (
                <input
                  type="number"
                  value={(value as number) ?? ''}
                  onChange={(e) => updateResposta(pergunta.id, e.target.value ? Number(e.target.value) : '')}
                  required={pergunta.required}
                  className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm text-zinc-800 shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/15 focus:outline-none transition-all duration-200"
                />
              )}

              {pergunta.type === 'checkbox' && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!value}
                    onChange={(e) => updateResposta(pergunta.id, e.target.checked)}
                    className="rounded text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-zinc-700">Sim</span>
                </label>
              )}

              {pergunta.type === 'select' && (
                <select
                  value={(value as string) || ''}
                  onChange={(e) => updateResposta(pergunta.id, e.target.value)}
                  required={pergunta.required}
                  className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm text-zinc-800 shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/15 focus:outline-none transition-all duration-200"
                >
                  <option value="">Selecione...</option>
                  {pergunta.options.map((opt, i) => (
                    <option key={i} value={opt}>{opt}</option>
                  ))}
                </select>
              )}

              {pergunta.type === 'multiselect' && (
                <div className="space-y-2">
                  {pergunta.options.map((opt, i) => {
                    const selected = Array.isArray(value) ? (value as string[]).includes(opt) : false
                    return (
                      <label key={i} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => {
                            const current = Array.isArray(value) ? [...(value as string[])] : []
                            if (selected) {
                              updateResposta(pergunta.id, current.filter((v) => v !== opt))
                            } else {
                              updateResposta(pergunta.id, [...current, opt])
                            }
                          }}
                          className="rounded text-primary focus:ring-primary"
                        />
                        <span className="text-sm text-zinc-700">{opt}</span>
                      </label>
                    )
                  })}
                </div>
              )}

              {pergunta.type === 'file' && (
                <input
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) updateResposta(pergunta.id, file.name)
                  }}
                  className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm text-zinc-800 shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/15 focus:outline-none transition-all duration-200"
                />
              )}
            </div>
          )
        })}
      </div>

      <div className="space-y-4 border-t border-zinc-200 pt-5">
        <div>
          <label className="block text-sm font-semibold text-zinc-700 mb-2">Assinatura Digital *</label>
          <SignaturePad
            onSign={(dataUrl) => setAssinatura(dataUrl)}
            onClear={() => setAssinatura(null)}
          />
        </div>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={aceite}
            onChange={(e) => setAceite(e.target.checked)}
            className="mt-0.5 rounded text-primary focus:ring-primary"
          />
          <span className="text-sm text-zinc-600 leading-relaxed">
            Li e aceito as informações acima. Declaro que as informações fornecidas são verdadeiras e autorizo o procedimento.
          </span>
        </label>
      </div>

      <div className="flex gap-4 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-xl border border-zinc-200 bg-white py-3 text-sm font-semibold text-zinc-700 shadow-sm transition-all duration-200 hover:bg-zinc-50 active:scale-[0.98]"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="flex-[2] rounded-xl bg-primary py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-primary-dark focus:ring-2 focus:ring-primary/15 focus:outline-none active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Confirmar e Assinar
        </button>
      </div>
    </div>
  )
}
