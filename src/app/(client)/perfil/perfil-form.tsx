'use client'

import { useActionState } from 'react'
import { updateProfile } from '@/lib/actions/auth'

interface Paciente {
  id: string
  user_id: string
  nome: string
  cpf: string | null
  nascimento: string | null
  telefone: string
  endereco: string | null
}

interface Usuario {
  role: string
}

export default function PerfilForm({
  paciente,
  usuario,
  userEmail,
}: {
  paciente: Paciente | null
  usuario: Usuario | null
  userEmail: string
}) {
  const [state, formAction, isPending] = useActionState(updateProfile, undefined)

  const isAdmin = usuario?.role === 'admin'

  return (
    <form action={formAction} className="space-y-6">
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label
              htmlFor="nome"
              className="block text-sm font-medium text-zinc-500"
            >
              Nome
            </label>
            <input
              type="text"
              id="nome"
              name="nome"
              defaultValue={paciente?.nome || ''}
              required
              className="mt-1 block w-full rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 text-zinc-800 focus:border-[#E1A293] focus:outline-none focus:ring-1 focus:ring-[#E1A293]"
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-zinc-500"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={userEmail}
              readOnly
              className="mt-1 block w-full rounded-lg border border-zinc-200 bg-zinc-100 px-3 py-2 text-zinc-500 cursor-not-allowed"
            />
            <p className="mt-1 text-xs text-zinc-400">
              O email não pode ser alterado.
            </p>
          </div>
          <div>
            <label
              htmlFor="telefone"
              className="block text-sm font-medium text-zinc-500"
            >
              Telefone
            </label>
            <input
              type="tel"
              id="telefone"
              name="telefone"
              defaultValue={paciente?.telefone || ''}
              required
              className="mt-1 block w-full rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 text-zinc-800 focus:border-[#E1A293] focus:outline-none focus:ring-1 focus:ring-[#E1A293]"
            />
          </div>
          <div>
            <label
              htmlFor="cpf"
              className="block text-sm font-medium text-zinc-500"
            >
              CPF
            </label>
            <input
              type="text"
              id="cpf"
              name="cpf"
              defaultValue={paciente?.cpf || ''}
              className="mt-1 block w-full rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 text-zinc-800 focus:border-[#E1A293] focus:outline-none focus:ring-1 focus:ring-[#E1A293]"
            />
          </div>
          <div>
            <label
              htmlFor="nascimento"
              className="block text-sm font-medium text-zinc-500"
            >
              Data de Nascimento
            </label>
            <input
              type="date"
              id="nascimento"
              name="nascimento"
              defaultValue={paciente?.nascimento || ''}
              className="mt-1 block w-full rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 text-zinc-800 focus:border-[#E1A293] focus:outline-none focus:ring-1 focus:ring-[#E1A293]"
            />
          </div>
          <div>
            <label
              htmlFor="endereco"
              className="block text-sm font-medium text-zinc-500"
            >
              Endereço
            </label>
            <input
              type="text"
              id="endereco"
              name="endereco"
              defaultValue={paciente?.endereco || ''}
              className="mt-1 block w-full rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 text-zinc-800 focus:border-[#E1A293] focus:outline-none focus:ring-1 focus:ring-[#E1A293]"
            />
          </div>
          {isAdmin && (
            <div className="sm:col-span-2">
              <label
                htmlFor="role"
                className="block text-sm font-medium text-zinc-500"
              >
                Perfil de Acesso
              </label>
              <select
                id="role"
                name="role"
                defaultValue={usuario?.role || 'client'}
                className="mt-1 block w-full rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 text-zinc-800 focus:border-[#E1A293] focus:outline-none focus:ring-1 focus:ring-[#E1A293]"
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

      {state?.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      {state?.success && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          Perfil atualizado com sucesso!
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-[#E1A293] px-6 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-[#d4917e] focus:outline-none focus:ring-2 focus:ring-[#E1A293] focus:ring-offset-2 disabled:opacity-50"
        >
          {isPending ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </div>
    </form>
  )
}
