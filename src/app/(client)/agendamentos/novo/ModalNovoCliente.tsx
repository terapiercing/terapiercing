'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { cadastrarCliente, NovoClienteResult } from '@/lib/actions/auth'

interface Cliente {
  id: string
  nome: string
  email: string
  telefone: string
  cpf: string | null
}

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

export default function ModalNovoCliente({
  isOpen,
  onClose,
  onClienteCreated,
}: {
  isOpen: boolean
  onClose: () => void
  onClienteCreated: (cliente: Cliente) => void
}) {
  const phoneRef = useRef<HTMLInputElement>(null)
  const cpfRef = useRef<HTMLInputElement>(null)
  const [state, formAction, pending] = useActionState<NovoClienteResult | undefined, FormData>(
    cadastrarCliente,
    undefined
  )

  useEffect(() => {
    if (state?.success && state.cliente) {
      onClienteCreated(state.cliente)
      onClose()
    }
  }, [state, onClienteCreated, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
          <h3 className="text-lg font-semibold text-zinc-800 flex items-center gap-2">
            <span>👤</span> Novo Cliente Rápido
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 transition-colors text-xl font-bold px-2"
          >
            &times;
          </button>
        </div>

        <form action={formAction} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
              Nome Completo <span className="text-red-500">*</span>
            </label>
            <input
              name="nome"
              type="text"
              required
              placeholder="Ex: Ana Maria Silva"
              className="w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm text-zinc-800 shadow-sm focus:border-[#E1A293] focus:ring-2 focus:ring-[#E1A293]/20 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                E-mail <span className="text-red-500">*</span>
              </label>
              <input
                name="email"
                type="email"
                required
                placeholder="cliente@email.com"
                className="w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm text-zinc-800 shadow-sm focus:border-[#E1A293] focus:ring-2 focus:ring-[#E1A293]/20 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                Senha Inicial <span className="text-red-500">*</span>
              </label>
              <input
                name="password"
                type="password"
                required
                minLength={6}
                placeholder="Mínimo 6 caracteres"
                className="w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm text-zinc-800 shadow-sm focus:border-[#E1A293] focus:ring-2 focus:ring-[#E1A293]/20 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                Telefone / WhatsApp <span className="text-red-500">*</span>
              </label>
              <input
                name="telefone"
                type="tel"
                required
                ref={phoneRef}
                onChange={(e) => {
                  e.target.value = formatPhone(e.target.value)
                }}
                placeholder="(00) 00000-0000"
                className="w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm text-zinc-800 shadow-sm focus:border-[#E1A293] focus:ring-2 focus:ring-[#E1A293]/20 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                CPF (Opcional)
              </label>
              <input
                name="cpf"
                type="text"
                ref={cpfRef}
                onChange={(e) => {
                  e.target.value = formatCpf(e.target.value)
                }}
                placeholder="000.000.000-00"
                className="w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm text-zinc-800 shadow-sm focus:border-[#E1A293] focus:ring-2 focus:ring-[#E1A293]/20 focus:outline-none"
              />
            </div>
          </div>

          {state?.error && (
            <div className="rounded-lg bg-red-50 px-3.5 py-2.5 text-xs text-red-600 border border-red-200">
              {state.error}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 shadow-sm hover:bg-zinc-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={pending}
              className="rounded-lg bg-[#E1A293] px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#d48d7c] transition-colors disabled:opacity-50"
            >
              {pending ? 'Cadastrando...' : 'Cadastrar e Selecionar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
