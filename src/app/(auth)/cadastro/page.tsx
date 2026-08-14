'use client'

import { useActionState, Suspense, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { signup } from '@/lib/actions/auth'
import Link from 'next/link'
import { useConfig } from '@/lib/config-context'

function formatCpf(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

function CadastroForm() {
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/dashboard'
  const [state, formAction, pending] = useActionState(signup, undefined)
  const cpfRef = useRef<HTMLInputElement>(null)
  const { nomeClinica } = useConfig()

  return (
    <div className="flex min-h-screen items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg space-y-8 bg-white p-8 rounded-3xl border border-zinc-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="text-center">
          <Link href="/" className="font-serif text-4xl tracking-tight text-secondary transition-opacity hover:opacity-80">
            {nomeClinica}
          </Link>
          <h2 className="mt-6 text-2xl font-semibold text-zinc-800">
            Crie sua conta
          </h2>
          <p className="mt-2 text-sm text-zinc-500">
            Preencha seus dados para começar a agendar seus procedimentos
          </p>
        </div>

        <form action={formAction} className="space-y-5">
          <input type="hidden" name="redirectTo" value={redirectTo} />

          <div className="space-y-4">
            <div>
              <label htmlFor="nome" className="block text-sm font-medium text-zinc-700">
                Nome Completo <span className="text-primary">*</span>
              </label>
              <input
                id="nome"
                name="nome"
                type="text"
                required
                className="mt-1.5 block w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-800 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/15"
                placeholder="Seu nome completo"
              />
            </div>

            <div>
              <label htmlFor="usuario" className="block text-sm font-medium text-zinc-700">
                Usuário
              </label>
              <input
                id="usuario"
                name="usuario"
                type="text"
                className="mt-1.5 block w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-800 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/15"
                placeholder="Nome de usuário para login"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-zinc-700">
                  Email <span className="text-primary">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="mt-1.5 block w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-800 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/15"
                  placeholder="seu@email.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-zinc-700">
                  Senha <span className="text-primary">*</span>
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="mt-1.5 block w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-800 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/15"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="telefone" className="block text-sm font-medium text-zinc-700">
                  Telefone <span className="text-primary">*</span>
                </label>
                <input
                  id="telefone"
                  name="telefone"
                  type="tel"
                  required
                  className="mt-1.5 block w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-800 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/15"
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
                  className="mt-1.5 block w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-800 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/15"
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
                className="mt-1.5 block w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-800 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/15"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="endereco" className="block text-sm font-medium text-zinc-700">
                  Endereço
                </label>
                <input
                  id="endereco"
                  name="endereco"
                  type="text"
                  className="mt-1.5 block w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-800 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/15"
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
                  className="mt-1.5 block w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-800 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/15"
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
                  className="mt-1.5 block w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-800 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/15"
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
                  className="mt-1.5 block w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-800 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/15"
                  placeholder="Cidade"
                />
              </div>
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
            className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-primary-dark focus:ring-2 focus:ring-primary/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? 'Criando conta...' : 'Cadastrar'}
          </button>
        </form>

        <p className="text-center text-sm text-zinc-500">
          Já tem uma conta?{' '}
          <Link
            href={`/login?redirectTo=${encodeURIComponent(redirectTo)}`}
            className="font-semibold text-primary transition-opacity hover:opacity-80"
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
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-background px-4 text-zinc-500 font-medium">Carregando...</div>}>
      <CadastroForm />
    </Suspense>
  )
}
