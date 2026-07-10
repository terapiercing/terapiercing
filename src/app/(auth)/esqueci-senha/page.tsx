'use client'

import { useActionState } from 'react'
import { forgotPassword } from '@/lib/actions/auth'
import Link from 'next/link'

export default function EsqueciSenhaPage() {
  const [state, formAction, pending] = useActionState(forgotPassword, undefined)

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAF7F5] px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link href="/" className="font-serif text-4xl tracking-tight text-[#D4AF37] hover:opacity-90">
            RBClinic
          </Link>
          <h2 className="mt-6 text-2xl font-semibold text-zinc-800">
            Esqueci minha senha
          </h2>
          <p className="mt-2 text-sm text-zinc-500">
            Informe seu CPF para receber um link de recuperação por email
          </p>
        </div>

        <form action={formAction} className="space-y-6">
          <div>
            <label htmlFor="cpf" className="block text-sm font-medium text-zinc-700">
              CPF
            </label>
            <input
              id="cpf"
              name="cpf"
              type="text"
              required
              maxLength={14}
              className="mt-1 block w-full rounded-lg border border-zinc-300 px-4 py-3 text-sm text-zinc-800 shadow-sm placeholder-zinc-400 focus:border-[#E1A293] focus:ring-2 focus:ring-[#E1A293]/20 focus:outline-none"
              placeholder="000.000.000-00"
            />
          </div>

          {state?.error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 border border-red-200">
              {state.error}
            </div>
          )}

          {state?.success && (
            <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-600 border border-green-200">
              Um link de recuperação foi enviado para o email cadastrado. Verifique sua caixa de entrada.
            </div>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-[#E1A293] px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#d48d7c] focus:ring-2 focus:ring-[#E1A293]/50 focus:outline-none active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? 'Enviando...' : 'Enviar Link de Recuperação'}
          </button>
        </form>

        <p className="text-center text-sm text-zinc-500">
          Lembrou sua senha?{' '}
          <Link
            href="/login"
            className="font-medium text-[#E1A293] hover:underline"
          >
            Voltar ao login
          </Link>
        </p>
      </div>
    </div>
  )
}
