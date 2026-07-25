'use client'

import { useActionState, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { cadastrarCliente } from '@/lib/actions/auth'

function formatCpf(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 10) {
    return digits
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2')
  }
  return digits
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
}

export default function ClienteForm() {
  const router = useRouter()
  const cpfRef = useRef<HTMLInputElement>(null)
  const phoneRef = useRef<HTMLInputElement>(null)
  const [state, formAction, pending] = useActionState(cadastrarCliente, undefined)
  const [showSuccess, setShowSuccess] = useState(false)

  if (state?.success && !showSuccess) {
    setShowSuccess(true)
  }

  return (
    <form action={formAction} className="space-y-6">
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-4">
        <h2 className="text-sm font-semibold text-zinc-700 uppercase tracking-wide">
          Dados Pessoais
        </h2>

        <div>
          <label htmlFor="nome" className="block text-sm font-medium text-zinc-700">
            Nome Completo <span className="text-[#C4917B]">*</span>
          </label>
          <input
            id="nome"
            name="nome"
            type="text"
            required
            className="mt-1 block w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm text-zinc-800 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all duration-200 focus:border-[#C4917B] focus:ring-2 focus:ring-[#C4917B]/15 focus:outline-none"
            placeholder="Nome completo do cliente"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-zinc-700">
              Email <span className="text-[#C4917B]">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-1 block w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm text-zinc-800 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all duration-200 focus:border-[#C4917B] focus:ring-2 focus:ring-[#C4917B]/15 focus:outline-none"
              placeholder="cliente@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-zinc-700">
              Senha <span className="text-[#C4917B]">*</span>
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              className="mt-1 block w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm text-zinc-800 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all duration-200 focus:border-[#C4917B] focus:ring-2 focus:ring-[#C4917B]/15 focus:outline-none"
              placeholder="Mínimo 6 caracteres"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="telefone" className="block text-sm font-medium text-zinc-700">
              Telefone <span className="text-[#C4917B]">*</span>
            </label>
            <input
              id="telefone"
              name="telefone"
              type="tel"
              required
              ref={phoneRef}
              maxLength={15}
              onChange={(e) => {
                if (phoneRef.current) {
                  phoneRef.current.value = formatPhone(e.target.value)
                }
              }}
              className="mt-1 block w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm text-zinc-800 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all duration-200 focus:border-[#C4917B] focus:ring-2 focus:ring-[#C4917B]/15 focus:outline-none"
              placeholder="(11) 99999-9999"
            />
          </div>

          <div>
            <label htmlFor="cpf" className="block text-sm font-medium text-zinc-700">
              CPF
            </label>
            <input
              id="cpf"
              name="cpf"
              type="text"
              ref={cpfRef}
              maxLength={14}
              onChange={(e) => {
                if (cpfRef.current) {
                  cpfRef.current.value = formatCpf(e.target.value)
                }
              }}
              className="mt-1 block w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm text-zinc-800 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all duration-200 focus:border-[#C4917B] focus:ring-2 focus:ring-[#C4917B]/15 focus:outline-none"
              placeholder="000.000.000-00"
            />
          </div>
        </div>

        <div>
          <label htmlFor="nascimento" className="block text-sm font-medium text-zinc-700">
            Data de Nascimento
          </label>
          <input
            id="nascimento"
            name="nascimento"
            type="date"
            className="mt-1 block w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm text-zinc-800 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all duration-200 focus:border-[#C4917B] focus:ring-2 focus:ring-[#C4917B]/15 focus:outline-none"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-4">
        <h2 className="text-sm font-semibold text-zinc-700 uppercase tracking-wide">
          Endereço
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="endereco" className="block text-sm font-medium text-zinc-700">
              Endereço
            </label>
            <input
              id="endereco"
              name="endereco"
              type="text"
              className="mt-1 block w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm text-zinc-800 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all duration-200 focus:border-[#C4917B] focus:ring-2 focus:ring-[#C4917B]/15 focus:outline-none"
              placeholder="Rua, Avenida..."
            />
          </div>

          <div>
            <label htmlFor="numero" className="block text-sm font-medium text-zinc-700">
              Número
            </label>
            <input
              id="numero"
              name="numero"
              type="text"
              className="mt-1 block w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm text-zinc-800 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all duration-200 focus:border-[#C4917B] focus:ring-2 focus:ring-[#C4917B]/15 focus:outline-none"
              placeholder="Nº"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="bairro" className="block text-sm font-medium text-zinc-700">
              Bairro
            </label>
            <input
              id="bairro"
              name="bairro"
              type="text"
              className="mt-1 block w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm text-zinc-800 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all duration-200 focus:border-[#C4917B] focus:ring-2 focus:ring-[#C4917B]/15 focus:outline-none"
              placeholder="Bairro"
            />
          </div>

          <div>
            <label htmlFor="cidade" className="block text-sm font-medium text-zinc-700">
              Cidade
            </label>
            <input
              id="cidade"
              name="cidade"
              type="text"
              className="mt-1 block w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm text-zinc-800 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all duration-200 focus:border-[#C4917B] focus:ring-2 focus:ring-[#C4917B]/15 focus:outline-none"
              placeholder="Cidade"
            />
          </div>
        </div>
      </div>

      {state?.error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 border border-red-200">
          {state.error}
        </div>
      )}

      {showSuccess && (
        <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700 border border-green-200">
          Cliente cadastrado com sucesso!
        </div>
      )}

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-[#C4917B] px-6 py-3 text-sm font-semibold text-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all duration-200 hover:bg-[#A87060] focus:ring-2 focus:ring-[#C4917B]/15 focus:outline-none active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? 'Cadastrando...' : 'Cadastrar Cliente'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-xl border border-zinc-200 bg-white px-6 py-3 text-sm font-semibold text-zinc-700 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all duration-200 hover:bg-zinc-50 active:scale-[0.98]"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
