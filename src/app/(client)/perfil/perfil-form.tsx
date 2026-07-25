'use client'

import { useActionState, useRef } from 'react'
import { updateProfile, changePassword } from '@/lib/actions/auth'

interface Usuario {
  id: string
  nome: string
  usuario: string | null
  email: string
  cpf: string | null
  nascimento: string | null
  telefone: string
  endereco: string | null
  numero: string | null
  bairro: string | null
  cidade: string | null
  role: string
}

function formatCpf(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

export default function PerfilForm({
  usuario,
  userEmail,
}: {
  usuario: Usuario | null
  userEmail: string
}) {
  const [profileState, profileAction, profilePending] = useActionState(updateProfile, undefined)
  const [passwordState, passwordAction, passwordPending] = useActionState(changePassword, undefined)
  const cpfRef = useRef<HTMLInputElement>(null)

  const isAdmin = usuario?.role === 'admin'

  return (
    <div className="space-y-6">
      <form action={profileAction} className="space-y-6">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <h2 className="mb-4 text-lg font-semibold text-zinc-800">Dados Pessoais</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="nome" className="block text-sm font-medium text-zinc-700">
                Nome
              </label>
              <input
                type="text"
                id="nome"
                name="nome"
                defaultValue={usuario?.nome || ''}
                required
                className="mt-1 block w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-zinc-800 focus:border-[#C4917B] focus:outline-none focus:ring-2 focus:ring-[#C4917B]/15"
              />
            </div>
            <div>
              <label htmlFor="usuario" className="block text-sm font-medium text-zinc-700">
                Usuário
              </label>
              <input
                type="text"
                id="usuario"
                name="usuario"
                defaultValue={usuario?.usuario || ''}
                className="mt-1 block w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-zinc-800 focus:border-[#C4917B] focus:outline-none focus:ring-2 focus:ring-[#C4917B]/15"
              />
            </div>
            <div>
              <label htmlFor="new_email" className="block text-sm font-medium text-zinc-700">
                Email
              </label>
              <input
                type="email"
                id="new_email"
                name="new_email"
                defaultValue={userEmail}
                className="mt-1 block w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-zinc-800 focus:border-[#C4917B] focus:outline-none focus:ring-2 focus:ring-[#C4917B]/15"
              />
            </div>
            <div>
              <label htmlFor="telefone" className="block text-sm font-medium text-zinc-700">
                Telefone
              </label>
              <input
                type="tel"
                id="telefone"
                name="telefone"
                defaultValue={usuario?.telefone || ''}
                required
                className="mt-1 block w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-zinc-800 focus:border-[#C4917B] focus:outline-none focus:ring-2 focus:ring-[#C4917B]/15"
              />
            </div>
            <div>
              <label htmlFor="cpf" className="block text-sm font-medium text-zinc-700">
                CPF
              </label>
              <input
                type="text"
                id="cpf"
                name="cpf"
                ref={cpfRef}
                defaultValue={usuario?.cpf ? formatCpf(usuario.cpf) : ''}
                maxLength={14}
                onChange={(e) => {
                  if (cpfRef.current) {
                    cpfRef.current.value = formatCpf(e.target.value)
                  }
                }}
                className="mt-1 block w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-zinc-800 focus:border-[#C4917B] focus:outline-none focus:ring-2 focus:ring-[#C4917B]/15"
              />
            </div>
            <div>
              <label htmlFor="nascimento" className="block text-sm font-medium text-zinc-700">
                Data de Nascimento
              </label>
              <input
                type="date"
                id="nascimento"
                name="nascimento"
                defaultValue={usuario?.nascimento || ''}
                className="mt-1 block w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-zinc-800 focus:border-[#C4917B] focus:outline-none focus:ring-2 focus:ring-[#C4917B]/15"
              />
            </div>
            <div>
              <label htmlFor="endereco" className="block text-sm font-medium text-zinc-700">
                Endereço
              </label>
              <input
                type="text"
                id="endereco"
                name="endereco"
                defaultValue={usuario?.endereco || ''}
                className="mt-1 block w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-zinc-800 focus:border-[#C4917B] focus:outline-none focus:ring-2 focus:ring-[#C4917B]/15"
              />
            </div>
            <div>
              <label htmlFor="numero" className="block text-sm font-medium text-zinc-700">
                Número
              </label>
              <input
                type="text"
                id="numero"
                name="numero"
                defaultValue={usuario?.numero || ''}
                className="mt-1 block w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-zinc-800 focus:border-[#C4917B] focus:outline-none focus:ring-2 focus:ring-[#C4917B]/15"
              />
            </div>
            <div>
              <label htmlFor="bairro" className="block text-sm font-medium text-zinc-700">
                Bairro
              </label>
              <input
                type="text"
                id="bairro"
                name="bairro"
                defaultValue={usuario?.bairro || ''}
                className="mt-1 block w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-zinc-800 focus:border-[#C4917B] focus:outline-none focus:ring-2 focus:ring-[#C4917B]/15"
              />
            </div>
            <div>
              <label htmlFor="cidade" className="block text-sm font-medium text-zinc-700">
                Cidade
              </label>
              <input
                type="text"
                id="cidade"
                name="cidade"
                defaultValue={usuario?.cidade || ''}
                className="mt-1 block w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-zinc-800 focus:border-[#C4917B] focus:outline-none focus:ring-2 focus:ring-[#C4917B]/15"
              />
            </div>
            {isAdmin && (
              <div className="sm:col-span-2">
                <label htmlFor="role" className="block text-sm font-medium text-zinc-700">
                  Perfil de Acesso
                </label>
                <select
                  id="role"
                  name="role"
                  defaultValue={usuario?.role || 'client'}
                  className="mt-1 block w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-zinc-800 focus:border-[#C4917B] focus:outline-none focus:ring-2 focus:ring-[#C4917B]/15"
                >
                  <option value="client">Cliente</option>
                  <option value="admin">Administrador</option>
                </select>
                <p className="mt-1 text-xs text-zinc-400">
                  Apenas administradores podem alterar o perfil de acesso.
                </p>
              </div>
            )}
          </div>
        </div>

        {profileState?.error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {profileState.error}
          </div>
        )}

        {profileState?.success && (
          <div className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            Perfil atualizado com sucesso!
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={profilePending}
            className="rounded-xl bg-[#C4917B] px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-[#A87060] focus:outline-none focus:ring-2 focus:ring-[#C4917B] focus:ring-offset-2 active:scale-[0.98] disabled:opacity-50"
          >
            {profilePending ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </form>

      <form action={passwordAction} className="space-y-6">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <h2 className="mb-4 text-lg font-semibold text-zinc-800">Alterar Senha</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="current_password" className="block text-sm font-medium text-zinc-700">
                Senha Atual
              </label>
              <input
                type="password"
                id="current_password"
                name="current_password"
                required
                className="mt-1 block w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-zinc-800 focus:border-[#C4917B] focus:outline-none focus:ring-2 focus:ring-[#C4917B]/15"
              />
            </div>
            <div className="sm:col-span-2 grid gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="new_password" className="block text-sm font-medium text-zinc-700">
                  Nova Senha
                </label>
                <input
                  type="password"
                  id="new_password"
                  name="new_password"
                  required
                  minLength={6}
                  className="mt-1 block w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-zinc-800 focus:border-[#C4917B] focus:outline-none focus:ring-2 focus:ring-[#C4917B]/15"
                />
              </div>
              <div>
                <label htmlFor="confirm_password" className="block text-sm font-medium text-zinc-700">
                  Confirmar Nova Senha
                </label>
                <input
                  type="password"
                  id="confirm_password"
                  name="confirm_password"
                  required
                  minLength={6}
                  className="mt-1 block w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-zinc-800 focus:border-[#C4917B] focus:outline-none focus:ring-2 focus:ring-[#C4917B]/15"
                />
              </div>
            </div>
          </div>
        </div>

        {passwordState?.error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {passwordState.error}
          </div>
        )}

        {passwordState?.success && (
          <div className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            Senha alterada com sucesso!
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={passwordPending}
            className="rounded-xl border border-zinc-200 bg-white px-6 py-2.5 text-sm font-medium text-zinc-700 shadow-sm transition-all duration-200 hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-[#C4917B] focus:ring-offset-2 active:scale-[0.98] disabled:opacity-50"
          >
            {passwordPending ? 'Alterando...' : 'Alterar Senha'}
          </button>
        </div>
      </form>
    </div>
  )
}
