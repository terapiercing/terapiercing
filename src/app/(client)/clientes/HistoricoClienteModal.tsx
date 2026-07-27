'use client'

import { useEffect, useState } from 'react'
import { getHistoricoCliente, type HistoricoCliente } from '@/lib/actions/auth'
import { jsPDF } from 'jspdf'

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-BR')
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatJsonFields(obj: Record<string, unknown>): string {
  return Object.entries(obj)
    .filter(([key]) => !key.startsWith('_'))
    .map(([key, value]) => {
      const label = key
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase())
      const val = value === null || value === undefined ? '—' : String(value)
      return `${label}: ${val}`
    })
    .join('\n')
}

function gerarPdfAnamnese(
  patientName: string,
  form: HistoricoCliente['formularios'][0]
) {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  let y = 20

  // Header
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('RBClinic', pageWidth / 2, y, { align: 'center' })
  y += 10

  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text('Ficha de Anamnese', pageWidth / 2, y, { align: 'center' })
  y += 15

  // Client info
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Dados do Cliente', 20, y)
  y += 7
  doc.setFont('helvetica', 'normal')
  doc.text(`Nome: ${patientName}`, 20, y)
  y += 7
  doc.text(`Servico: ${form.servicoNome ?? 'N/A'}`, 20, y)
  y += 7
  doc.text(`Modelo: ${form.templateNome ?? 'N/A'}`, 20, y)
  y += 7
  doc.text(`Preenchido em: ${formatDate(form.criadoEm)}`, 20, y)
  y += 7
  if (form.aceitoEm) {
    doc.text(`Assinado em: ${formatDateTime(form.aceitoEm)}`, 20, y)
    y += 7
  }
  y += 5

  // Divider
  doc.setDrawColor(200)
  doc.line(20, y, pageWidth - 20, y)
  y += 10

  // Form fields
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Respostas', 20, y)
  y += 8

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)

  const entries = Object.entries(form.camposJson).filter(([key]) => !key.startsWith('_'))
  for (const [key, value] of entries) {
    const label = key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    const val = value === null || value === undefined ? '—' : String(value)

    const labelLines = doc.splitTextToSize(`${label}:`, pageWidth - 40)
    const valueLines = doc.splitTextToSize(val, pageWidth - 40)

    if (y + labelLines.length * 5 + valueLines.length * 5 > 260) {
      doc.addPage()
      y = 20
    }

    doc.setFont('helvetica', 'bold')
    for (const line of labelLines) {
      doc.text(line, 20, y)
      y += 5
    }
    doc.setFont('helvetica', 'normal')
    for (const line of valueLines) {
      doc.text(line, 20, y)
      y += 5
    }
    y += 3
  }

  // Signature
  const assinatura = form.camposJson['_assinatura'] as string | undefined
  if (assinatura) {
    y += 5
    if (y + 50 > 260) {
      doc.addPage()
      y = 20
    }

    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('Assinatura Digital', 20, y)
    y += 8

    doc.addImage(assinatura, 'PNG', 20, y, 70, 25)
    y += 30

    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    if (form.aceitoEm) {
      doc.text(`Assinado digitalmente em ${formatDateTime(form.aceitoEm)}`, 20, y)
    }
  }

  // Footer
  const totalPages = doc.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(150)
    doc.text(
      `RBClinic - Ficha de Anamnese - Pagina ${i} de ${totalPages}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    )
    doc.setTextColor(0)
  }

  const filename = `anamnese_${patientName.replace(/\s+/g, '_')}_${formatDate(form.criadoEm).replace(/\//g, '-')}.pdf`
  doc.save(filename)
}

const statusColors: Record<string, string> = {
  Pendente: 'bg-yellow-100 text-yellow-700',
  Confirmado: 'bg-blue-100 text-blue-700',
  Concluido: 'bg-green-100 text-green-700',
  Cancelado: 'bg-red-100 text-red-700',
}

const statusLabels: Record<string, string> = {
  Pendente: 'Pendente',
  Confirmado: 'Confirmado',
  Concluido: 'Concluído',
  Cancelado: 'Cancelado',
}

export default function HistoricoClienteModal({
  patientId,
  patientName,
  onClose,
}: {
  patientId: string
  patientName: string
  onClose: () => void
}) {
  const [data, setData] = useState<HistoricoCliente | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedForm, setExpandedForm] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function fetchHistory() {
      setLoading(true)
      const result = await getHistoricoCliente(patientId)
      if (cancelled) return
      if (result.error) {
        setError(result.error)
      } else {
        setData(result.data)
      }
      setLoading(false)
    }
    fetchHistory()
    return () => { cancelled = true }
  }, [patientId])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-3 sm:p-4">
      <div className="w-full max-w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-3 sm:px-6 sm:py-4 rounded-t-3xl">
          <div>
            <h2 className="text-lg font-semibold text-zinc-800">
              Histórico do Cliente
            </h2>
            <p className="text-sm text-zinc-500">{patientName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 transition-colors text-xl leading-none"
          >
            &times;
          </button>
        </div>

        <div className="p-4 sm:p-6">
          {/* Loading */}
          {loading && (
            <div className="py-12 text-center text-zinc-400">
              Carregando histórico...
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 border border-red-200">
              {error}
            </div>
          )}

          {/* Content */}
          {data && !loading && (
            <div className="space-y-8">
              {/* Resumo Geral */}
              <div>
                <h3 className="text-sm font-semibold text-zinc-700 uppercase tracking-wide mb-3">
                  Resumo
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-center">
                    <p className="text-2xl font-bold text-[#C4917B]">
                      {data.totalAtendimentos}
                    </p>
                    <p className="text-xs text-zinc-500 mt-1">Total</p>
                  </div>
                  <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {data.atendimentosPorStatus.Concluido}
                    </p>
                    <p className="text-xs text-zinc-500 mt-1">Concluídos</p>
                  </div>
                  <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-center">
                    <p className="text-2xl font-bold text-yellow-600">
                      {data.atendimentosPorStatus.Pendente + data.atendimentosPorStatus.Confirmado}
                    </p>
                    <p className="text-xs text-zinc-500 mt-1">Agendados</p>
                  </div>
                  <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-center">
                    <p className="text-2xl font-bold text-red-500">
                      {data.atendimentosPorStatus.Cancelado}
                    </p>
                    <p className="text-xs text-zinc-500 mt-1">Cancelados</p>
                  </div>
                </div>
              </div>

              {/* Procedimentos */}
              <div>
                <h3 className="text-sm font-semibold text-zinc-700 uppercase tracking-wide mb-3">
                  Procedimentos Realizados
                </h3>
                {data.procedimentos.length > 0 ? (
                  <div className="space-y-2">
                    {data.procedimentos.map((proc) => (
                      <div
                        key={proc.nome}
                        className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3"
                      >
                        <div>
                          <p className="text-sm font-medium text-zinc-800">{proc.nome}</p>
                          <p className="text-xs text-zinc-400">
                            Último: {formatDate(proc.ultimaData)}
                          </p>
                        </div>
                        <span className="rounded-full bg-[#C4917B]/10 px-3 py-1 text-xs font-semibold text-[#C4917B]">
                          {proc.quantidade}x
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-zinc-400">Nenhum procedimento registrado.</p>
                )}
              </div>

              {/* Status dos Agendamentos */}
              <div>
                <h3 className="text-sm font-semibold text-zinc-700 uppercase tracking-wide mb-3">
                  Distribuição por Status
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(Object.entries(data.atendimentosPorStatus) as [string, number][]).map(
                    ([status, count]) => (
                      <span
                        key={status}
                        className={`rounded-full px-4 py-1.5 text-xs font-medium ${statusColors[status]}`}
                      >
                        {statusLabels[status]}: {count}
                      </span>
                    )
                  )}
                </div>
              </div>

              {/* Formulários Preenchidos */}
              <div>
                <h3 className="text-sm font-semibold text-zinc-700 uppercase tracking-wide mb-3">
                  Formulários Preenchidos ({data.formularios.length})
                </h3>
                {data.formularios.length > 0 ? (
                  <div className="space-y-3">
                    {data.formularios.map((form) => (
                      <div
                        key={form.id}
                        className="rounded-xl border border-zinc-200 bg-white overflow-hidden"
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedForm(expandedForm === form.id ? null : form.id)
                          }
                          className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-zinc-50 transition-colors"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-zinc-800">
                              {form.servicoNome ?? 'Serviço removido'}
                            </p>
                            <p className="text-xs text-zinc-400">
                              {form.templateNome ?? 'Sem template'} — {formatDate(form.criadoEm)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {form.aceiteDigital && (
                              <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-700">
                                Aceito
                              </span>
                            )}
                            <span className="text-zinc-400 text-sm">
                              {expandedForm === form.id ? '▲' : '▼'}
                            </span>
                          </div>
                        </button>

                        {expandedForm === form.id && (
                          <div className="border-t border-zinc-100 px-4 py-3 bg-zinc-50 space-y-4">
                            <pre className="whitespace-pre-wrap text-xs text-zinc-600 font-mono leading-relaxed">
                              {formatJsonFields(form.camposJson)}
                            </pre>

                            {typeof form.camposJson['_assinatura'] === 'string' && form.camposJson['_assinatura'] && (
                              <div>
                                <p className="text-xs font-semibold text-zinc-500 mb-2">Assinatura Digital:</p>
                                <img
                                  src={form.camposJson['_assinatura'] as string}
                                  alt="Assinatura digital"
                                  className="max-w-[250px] h-auto rounded-lg border border-zinc-200 bg-white"
                                />
                                {form.aceitoEm && (
                                  <p className="text-[10px] text-zinc-400 mt-1">
                                    Assinado em: {formatDateTime(form.aceitoEm)}
                                  </p>
                                )}
                              </div>
                            )}

                            <button
                              type="button"
                              onClick={() => gerarPdfAnamnese(patientName, form)}
                              className="inline-flex items-center gap-2 rounded-xl border border-[#C4917B] bg-white px-4 py-2 text-xs font-semibold text-[#C4917B] hover:bg-[#C4917B]/5 transition-all duration-200 active:scale-[0.98]"
                            >
                              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                              </svg>
                              Baixar PDF
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-zinc-400">Nenhum formulário preenchido.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
