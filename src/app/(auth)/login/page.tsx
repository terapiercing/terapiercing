'use client'

import { useActionState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { login } from '@/lib/actions/auth'
import Link from 'next/link'

function LoginForm() {
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/dashboard'
  const [state, formAction, pending] = useActionState(login, undefined)

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAF7F5] px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link href="/" className="font-serif text-4xl tracking-tight text-[#D4AF37] hover:opacity-90">
            RBClinic
          </Link>
          <h2 className="mt-6 text-2xl font-semibold text-zinc-800">
            Olá de volta!
          </h2>
          <p className="mt-2 text-sm text-zinc-500">
            Entre com seu email ou CPF e senha
          </p>
        </div>

        <form action={formAction} className="space-y-6">
          <input type="hidden" name="redirectTo" value={redirectTo} />

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-zinc-700">
                Email ou CPF
              </label>
              <input
                id="email"
                name="email"
                type="text"
                required
                className="mt-1 block w-full rounded-lg border border-zinc-300 px-4 py-3 text-sm text-zinc-800 shadow-sm placeholder-zinc-400 focus:border-[#E1A293] focus:ring-2 focus:ring-[#E1A293]/20 focus:outline-none"
                placeholder="seu@email.com ou 000.000.000-00"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-zinc-700">
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="mt-1 block w-full rounded-lg border border-zinc-300 px-4 py-3 text-sm text-zinc-800 shadow-sm placeholder-zinc-400 focus:border-[#E1A293] focus:ring-2 focus:ring-[#E1A293]/20 focus:outline-none"
                placeholder="••••••••"
              />
            </div>
          </div>

          {state?.error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 border border-red-200">
              {state.error}
            </div>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-[#E1A293] px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#d48d7c] focus:ring-2 focus:ring-[#E1A293]/50 focus:outline-none active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="text-center">
          <Link
            href="/esqueci-senha"
            className="text-sm font-medium text-[#E1A293] hover:underline"
          >
            Esqueci minha senha
          </Link>
        </div>

        <p className="text-center text-sm text-zinc-500">
          Ainda não tem conta?{' '}
          <Link
            href={`/cadastro?redirectTo=${encodeURIComponent(redirectTo)}`}
            className="font-medium text-[#E1A293] hover:underline"
          >
            Cadastre-se
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[#FAF7F5] px-4 text-zinc-500 font-medium">Carregando...</div>}>
      <LoginForm />
    </Suspense>
  )
}
