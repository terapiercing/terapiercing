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
    <div className="flex min-h-screen items-center justify-center bg-[#FDFAF8] px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link href="/" className="font-serif text-4xl tracking-tight text-[#D4AF37] transition-opacity hover:opacity-80">
            RBClinic
          </Link>
          <h2 className="mt-6 text-2xl font-semibold text-zinc-800">
            Olá de volta!
          </h2>
          <p className="mt-2 text-sm text-zinc-500">
            Entre com seu email, CPF ou usuário e senha
          </p>
        </div>

        <form action={formAction} className="space-y-5">
          <input type="hidden" name="redirectTo" value={redirectTo} />

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-zinc-700">
                Email, CPF ou Usuário
              </label>
              <input
                id="email"
                name="email"
                type="text"
                required
                className="mt-1.5 block w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-800 shadow-[0_1px_2px_rgba(0,0,0,0.04)] placeholder:text-zinc-400 transition-all duration-200 focus:border-[#C4917B] focus:ring-2 focus:ring-[#C4917B]/15"
                placeholder="seu@email.com, 000.000.000-00 ou usuário"
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
                className="mt-1.5 block w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-800 shadow-[0_1px_2px_rgba(0,0,0,0.04)] placeholder:text-zinc-400 transition-all duration-200 focus:border-[#C4917B] focus:ring-2 focus:ring-[#C4917B]/15"
                placeholder="••••••••"
              />
            </div>
          </div>

          {state?.error && (
            <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 border border-red-200" role="alert">
              {state.error}
            </div>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-xl bg-[#C4917B] px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#A87060] focus:ring-2 focus:ring-[#C4917B]/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="text-center">
          <Link
            href="/esqueci-senha"
            className="text-sm font-medium text-[#C4917B] transition-opacity hover:opacity-80"
          >
            Esqueci minha senha
          </Link>
        </div>

        <p className="text-center text-sm text-zinc-500">
          Ainda não tem conta?{' '}
          <Link
            href={`/cadastro?redirectTo=${encodeURIComponent(redirectTo)}`}
            className="font-semibold text-[#C4917B] transition-opacity hover:opacity-80"
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
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[#FDFAF8] px-4 text-zinc-500 font-medium">Carregando...</div>}>
      <LoginForm />
    </Suspense>
  )
}
