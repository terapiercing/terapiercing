'use client'

import { useActionState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { signup } from '@/lib/actions/auth'
import Link from 'next/link'

function CadastroForm() {
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/dashboard'
  const [state, formAction, pending] = useActionState(
    signup,
    undefined
  )

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAF7F5] py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg space-y-8 bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm">
        <div className="text-center">
          <Link href="/" className="font-serif text-4xl tracking-tight text-[#D4AF37] hover:opacity-90">
            RBClinic
          </Link>
          <h2 className="mt-6 text-2xl font-semibold text-zinc-800">
            Crie sua conta
          </h2>
          <p className="mt-2 text-sm text-zinc-500">
            Preencha seus dados para começar a agendar seus procedimentos
          </p>
        </div>

        <form action={formAction} className="space-y-6">
          <input type="hidden" name="redirectTo" value={redirectTo} />

          <div className="space-y-4">
            <div>
              <label
                htmlFor="nome"
                className="block text-sm font-medium text-zinc-700"
              >
                Nome Completo <span className="text-[#E1A293]">*</span>
              </label>
              <input
                id="nome"
                name="nome"
                type="text"
                required
                className="mt-1 block w-full rounded-lg border border-zinc-300 px-4 py-3 text-sm text-zinc-800 shadow-sm focus:border-[#E1A293] focus:ring-2 focus:ring-[#E1A293]/20 focus:outline-none"
                placeholder="Seu nome completo"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-zinc-700"
                >
                  Email <span className="text-[#E1A293]">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="mt-1 block w-full rounded-lg border border-zinc-300 px-4 py-3 text-sm text-zinc-800 shadow-sm focus:border-[#E1A293] focus:ring-2 focus:ring-[#E1A293]/20 focus:outline-none"
                  placeholder="seu@email.com"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-zinc-700"
                >
                  Senha <span className="text-[#E1A293]">*</span>
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="mt-1 block w-full rounded-lg border border-zinc-300 px-4 py-3 text-sm text-zinc-800 shadow-sm focus:border-[#E1A293] focus:ring-2 focus:ring-[#E1A293]/20 focus:outline-none"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="telefone"
                  className="block text-sm font-medium text-zinc-700"
                >
                  Telefone <span className="text-[#E1A293]">*</span>
                </label>
                <input
                  id="telefone"
                  name="telefone"
                  type="tel"
                  required
                  className="mt-1 block w-full rounded-lg border border-zinc-300 px-4 py-3 text-sm text-zinc-800 shadow-sm focus:border-[#E1A293] focus:ring-2 focus:ring-[#E1A293]/20 focus:outline-none"
                  placeholder="(11) 99999-9999"
                />
              </div>

              <div>
                <label
                  htmlFor="cpf"
                  className="block text-sm font-medium text-zinc-700"
                >
                  CPF
                </label>
                <input
                  id="cpf"
                  name="cpf"
                  type="text"
                  className="mt-1 block w-full rounded-lg border border-zinc-300 px-4 py-3 text-sm text-zinc-800 shadow-sm focus:border-[#E1A293] focus:ring-2 focus:ring-[#E1A293]/20 focus:outline-none"
                  placeholder="000.000.000-00"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="nascimento"
                  className="block text-sm font-medium text-zinc-700"
                >
                  Data de Nascimento
                </label>
                <input
                  id="nascimento"
                  name="nascimento"
                  type="date"
                  className="mt-1 block w-full rounded-lg border border-zinc-300 px-4 py-3 text-sm text-zinc-800 shadow-sm focus:border-[#E1A293] focus:ring-2 focus:ring-[#E1A293]/20 focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="endereco"
                  className="block text-sm font-medium text-zinc-700"
                >
                  Endereço
                </label>
                <input
                  id="endereco"
                  name="endereco"
                  type="text"
                  className="mt-1 block w-full rounded-lg border border-zinc-300 px-4 py-3 text-sm text-zinc-800 shadow-sm focus:border-[#E1A293] focus:ring-2 focus:ring-[#E1A293]/20 focus:outline-none"
                  placeholder="Rua, Número, Bairro"
                />
              </div>
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
            {pending ? 'Criando conta...' : 'Cadastrar'}
          </button>
        </form>

        <p className="text-center text-sm text-zinc-500">
          Já tem uma conta?{' '}
          <Link
            href={`/login?redirectTo=${encodeURIComponent(redirectTo)}`}
            className="font-medium text-[#E1A293] hover:underline"
          >
            Faça login
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function CadastroPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[#FAF7F5] px-4 text-zinc-500 font-medium">Carregando...</div>}>
      <CadastroForm />
    </Suspense>
  )
}
