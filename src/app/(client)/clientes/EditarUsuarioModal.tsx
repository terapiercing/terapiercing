'use client'

import { useActionState, useRef, useEffect } from 'react'
import { updateUsuario } from '@/lib/actions/auth'

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

export default function EditarUsuarioModal({
  usuario,
  onClose,
}: {
  usuario: Usuario
  onClose: () => void
}) {
  const [state, formAction, pending] = useActionState(updateUsuario, undefined)
  const cpfRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (state?.success) {
      onClose()
    }
  }, [state, onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-3 sm:p-4">
      <div className="w-full max-w-full sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-white shadow-2xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-3 sm:px-6 sm:py-4 rounded-t-3xl">
          <h2 className="text-base font-semibold text-zinc-800 sm:text-lg truncate pr-2">
            Editar {usuario.nome}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 transition-colors text-xl leading-none"
          >
            &times;
          </button>
        </div>

        <form action={formAction} className="p-4 sm:p-6 space-y-4">
          <input type="hidden" name="userId" value={usuario.id} />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="edit-nome" className="block text-sm font-medium text-zinc-700">
                Nome Completo <span className="text-[#C4917B]">*</span>
              </label>
              <input
                id="edit-nome"
                name="nome"
                type="text"
                required
                defaultValue={usuario.nome}
                className="mt-1 block w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm text-zinc-800 transition-all duration-200 focus:border-[#C4917B] focus:ring-2 focus:ring-[#C4917B]/15 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="edit-usuario" className="block text-sm font-medium text-zinc-700">
                Usuário
              </label>
              <input
                id="edit-usuario"
                name="usuario"
                type="text"
                defaultValue={usuario.usuario || ''}
                className="mt-1 block w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm text-zinc-800 transition-all duration-200 focus:border-[#C4917B] focus:ring-2 focus:ring-[#C4917B]/15 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="edit-email" className="block text-sm font-medium text-zinc-700">
                Email
              </label>
              <input
                id="edit-email"
                name="email"
                type="email"
                defaultValue={usuario.email}
                disabled
                className="mt-1 block w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label htmlFor="edit-telefone" className="block text-sm font-medium text-zinc-700">
                Telefone <span className="text-[#C4917B]">*</span>
              </label>
              <input
                id="edit-telefone"
                name="telefone"
                type="tel"
                required
                defaultValue={usuario.telefone}
                className="mt-1 block w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm text-zinc-800 transition-all duration-200 focus:border-[#C4917B] focus:ring-2 focus:ring-[#C4917B]/15 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="edit-cpf" className="block text-sm font-medium text-zinc-700">
                CPF
              </label>
              <input
                id="edit-cpf"
                name="cpf"
                type="text"
                ref={cpfRef}
                defaultValue={usuario.cpf ? formatCpf(usuario.cpf) : ''}
                maxLength={14}
                onChange={(e) => {
                  if (cpfRef.current) {
                    cpfRef.current.value = formatCpf(e.target.value)
                  }
                }}
                className="mt-1 block w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm text-zinc-800 transition-all duration-200 focus:border-[#C4917B] focus:ring-2 focus:ring-[#C4917B]/15 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="edit-nascimento" className="block text-sm font-medium text-zinc-700">
                Data de Nascimento
              </label>
              <input
                id="edit-nascimento"
                name="nascimento"
                type="date"
                defaultValue={usuario.nascimento || ''}
                className="mt-1 block w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm text-zinc-800 transition-all duration-200 focus:border-[#C4917B] focus:ring-2 focus:ring-[#C4917B]/15 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="edit-endereco" className="block text-sm font-medium text-zinc-700">
                Endereço
              </label>
              <input
                id="edit-endereco"
                name="endereco"
                type="text"
                defaultValue={usuario.endereco || ''}
                className="mt-1 block w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm text-zinc-800 transition-all duration-200 focus:border-[#C4917B] focus:ring-2 focus:ring-[#C4917B]/15 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="edit-numero" className="block text-sm font-medium text-zinc-700">
                Número
              </label>
              <input
                id="edit-numero"
                name="numero"
                type="text"
                defaultValue={usuario.numero || ''}
                className="mt-1 block w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm text-zinc-800 transition-all duration-200 focus:border-[#C4917B] focus:ring-2 focus:ring-[#C4917B]/15 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="edit-bairro" className="block text-sm font-medium text-zinc-700">
                Bairro
              </label>
              <input
                id="edit-bairro"
                name="bairro"
                type="text"
                defaultValue={usuario.bairro || ''}
                className="mt-1 block w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm text-zinc-800 transition-all duration-200 focus:border-[#C4917B] focus:ring-2 focus:ring-[#C4917B]/15 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="edit-cidade" className="block text-sm font-medium text-zinc-700">
                Cidade
              </label>
              <input
                id="edit-cidade"
                name="cidade"
                type="text"
                defaultValue={usuario.cidade || ''}
                className="mt-1 block w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm text-zinc-800 transition-all duration-200 focus:border-[#C4917B] focus:ring-2 focus:ring-[#C4917B]/15 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="edit-role" className="block text-sm font-medium text-zinc-700">
                Perfil de Acesso
              </label>
              <select
                id="edit-role"
                name="role"
                defaultValue={usuario.role}
                className="mt-1 block w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm text-zinc-800 transition-all duration-200 focus:border-[#C4917B] focus:ring-2 focus:ring-[#C4917B]/15 focus:outline-none"
              >
                <option value="client">Cliente</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
          </div>

          {state?.error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 border border-red-200">
              {state.error}
            </div>
          )}

          <div className="flex gap-3 justify-end pt-2 border-t border-zinc-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm transition-all duration-200 hover:bg-zinc-50 active:scale-[0.98] sm:px-5 sm:py-2.5"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={pending}
              className="rounded-xl bg-[#C4917B] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#A87060] active:scale-[0.98] disabled:opacity-50 sm:px-5 sm:py-2.5"
            >
              {pending ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
