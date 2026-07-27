'use client'

export default function ModalPagamentoPendente({
  isOpen,
  onConfirm,
}: {
  isOpen: boolean
  onConfirm: () => void
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-3 sm:p-4">
      <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl p-6 sm:p-8 space-y-5">
        {/* Ícone de sucesso */}
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg
              className="h-8 w-8 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 12.75l6 6 9-13.5"
              />
            </svg>
          </div>
        </div>

        {/* Título */}
        <h2 className="text-center text-xl font-semibold text-zinc-800">
          Agendamento Criado!
        </h2>

        {/* Mensagem */}
        <div className="space-y-3 text-sm text-zinc-600 leading-relaxed">
          <p>
            Seu agendamento foi realizado com sucesso e está{' '}
            <span className="font-semibold text-yellow-600">pendente de confirmação</span>.
          </p>
          <p>
            Para confirmar seu horário, realize o pagamento do sinal no valor de{' '}
            <span className="font-semibold text-zinc-800">R$ 20,00</span>.
          </p>
        </div>

        {/* Dados PIX */}
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Chave PIX (CPF)
          </p>
          <p className="text-lg font-mono font-semibold text-zinc-800">
            105.290.917-55
          </p>
        </div>

        {/* Instrução */}
        <p className="text-center text-xs text-zinc-400">
          Após o pagamento, seu agendamento será confirmado automaticamente.
        </p>

        {/* Botão */}
        <button
          onClick={onConfirm}
          className="w-full rounded-xl bg-[#C4917B] py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#A87060] active:scale-[0.98]"
        >
          Entendido
        </button>
      </div>
    </div>
  )
}
