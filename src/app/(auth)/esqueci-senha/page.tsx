'use client'

import { useActionState, Suspense, useRef, useState, useEffect } from 'react'
import { verifyResetIdentity, resetPasswordDirect } from '@/lib/actions/auth'
import Link from 'next/link'
import { useConfig } from '@/lib/config-context'

function formatCpf(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

function EsqueciSenhaForm() {
  const [step, setStep] = useState<'verify' | 'reset'>('verify')
  const [userId, setUserId] = useState('')
  const [verifyState, verifyFormAction, verifyPending] = useActionState(verifyResetIdentity, undefined)
  const [resetState, resetFormAction, resetPending] = useActionState(resetPasswordDirect, undefined)
  const cpfRef = useRef<HTMLInputElement>(null)
  const { nomeClinica } = useConfig()

  useEffect(() => {
    if (verifyState?.verified && verifyState.userId) {
      setUserId(verifyState.userId)
      setStep('reset')
    }
  }, [verifyState])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link href="/" className="font-serif text-4xl tracking-tight text-secondary hover:opacity-90">
            {nomeClinica}
          </Link>
          <h2 className="mt-6 text-2xl font-semibold text-zinc-800">
            {step === 'verify' ? 'Esqueci minha senha' : 'Redefinir senha'}
          </h2>
          <p className="mt-2 text-sm text-zinc-500">
            {step === 'verify'
              ? 'Informe seu e-mail e CPF para verificar sua identidade'
              : 'Informe sua nova senha abaixo'}
          </p>
        </div>

        {step === 'verify' ? (
          <form action={verifyFormAction} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-zinc-700">
                  E-mail
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="mt-1 block w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm text-zinc-800 shadow-[0_1px_2px_rgba(0,0,0,0.04)] placeholder-zinc-400 focus:border-primary focus:ring-2 focus:ring-primary/15 focus:outline-none"
                  placeholder="seu@email.com"
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
                  required
                  ref={cpfRef}
                  maxLength={14}
                  onChange={(e) => {
                    if (cpfRef.current) {
                      cpfRef.current.value = formatCpf(e.target.value)
                    }
                  }}
                  className="mt-1 block w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm text-zinc-800 shadow-[0_1px_2px_rgba(0,0,0,0.04)] placeholder-zinc-400 focus:border-primary focus:ring-2 focus:ring-primary/15 focus:outline-none"
                  placeholder="000.000.000-00"
                />
              </div>
            </div>

            {verifyState?.error && (
              <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 border border-red-200">
                {verifyState.error}
              </div>
            )}

            <button
              type="submit"
              disabled={verifyPending}
              className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-primary-dark focus:ring-2 focus:ring-primary/30 focus:outline-none active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {verifyPending ? 'Verificando...' : 'Verificar Identidade'}
            </button>
          </form>
        ) : (
          <form action={resetFormAction} className="space-y-6">
            <input type="hidden" name="userId" value={userId} />

            <div className="space-y-4">
              <div>
                <label htmlFor="new_password" className="block text-sm font-medium text-zinc-700">
                  Nova Senha
                </label>
                <input
                  id="new_password"
                  name="new_password"
                  type="password"
                  required
                  minLength={6}
                  className="mt-1 block w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm text-zinc-800 shadow-[0_1px_2px_rgba(0,0,0,0.04)] placeholder-zinc-400 focus:border-primary focus:ring-2 focus:ring-primary/15 focus:outline-none"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>

              <div>
                <label htmlFor="confirm_password" className="block text-sm font-medium text-zinc-700">
                  Confirmar Nova Senha
                </label>
                <input
                  id="confirm_password"
                  name="confirm_password"
                  type="password"
                  required
                  minLength={6}
                  className="mt-1 block w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm text-zinc-800 shadow-[0_1px_2px_rgba(0,0,0,0.04)] placeholder-zinc-400 focus:border-primary focus:ring-2 focus:ring-primary/15 focus:outline-none"
                  placeholder="Repita a nova senha"
                />
              </div>
            </div>

            {resetState?.error && (
              <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 border border-red-200">
                {resetState.error}
              </div>
            )}

            {resetState?.success && (
              <div className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-600 border border-green-200">
                Senha redefinida com sucesso! Você já pode fazer login.
              </div>
            )}

            {!resetState?.success && (
              <button
                type="submit"
                disabled={resetPending}
                className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-primary-dark focus:ring-2 focus:ring-primary/30 focus:outline-none active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {resetPending ? 'Redefinindo...' : 'Redefinir Senha'}
              </button>
            )}
          </form>
        )}

        <p className="text-center text-sm text-zinc-500">
          Lembrou sua senha?{' '}
          <Link
            href="/login"
            className="font-medium text-primary transition-opacity hover:opacity-80"
          >
            Voltar ao login
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function EsqueciSenhaPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-background px-4 text-zinc-500 font-medium">Carregando...</div>}>
      <EsqueciSenhaForm />
    </Suspense>
  )
}
