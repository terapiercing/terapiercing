'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { toggleUserRole } from '@/lib/actions/auth'

interface Usuario {
  id: string
  nome: string
  email: string
  cpf: string | null
  telefone: string
  role: string
  created_at: string
}

export default function ClientesList({ usuarios }: { usuarios: Usuario[] }) {
  const [search, setSearch] = useState('')
  const [isPending, startTransition] = useTransition()

  const filtered = usuarios.filter((u) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      u.nome.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.cpf?.includes(q) ||
      u.telefone.includes(q)
    )
  })

  const handleToggleRole = (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'client' : 'admin'
    startTransition(async () => {
      await toggleUserRole(userId, newRole)
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-zinc-800">Clientes</h1>
          <p className="mt-1 text-zinc-500">
            Gerenciar clientes cadastrados no sistema.
          </p>
        </div>
        <Link
          href="/clientes/novo"
          className="inline-flex justify-center items-center rounded-lg bg-[#E1A293] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#d48d7c]"
        >
          Novo Cliente
        </Link>
      </div>

      {/* Busca */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome, email, CPF ou telefone..."
          className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm text-zinc-800 shadow-sm focus:border-[#E1A293] focus:ring-2 focus:ring-[#E1A293]/20 focus:outline-none"
        />
      </div>

      {/* Lista */}
      {filtered.length > 0 ? (
        <div className="space-y-3">
          <p className="text-xs text-zinc-400">
            {filtered.length} cliente{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
          </p>
          {filtered.map((usuario) => (
            <div
              key={usuario.id}
              className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1 min-w-0">
                  <p className="font-semibold text-zinc-800">{usuario.nome}</p>
                  <p className="text-sm text-zinc-500">{usuario.email}</p>
                  {usuario.cpf && (
                    <p className="text-sm text-zinc-400">
                      CPF: {usuario.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')}
                    </p>
                  )}
                  <p className="text-sm text-zinc-400">
                    Tel: {usuario.telefone}
                  </p>
                  <p className="text-xs text-zinc-300">
                    Cadastrado em {new Date(usuario.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      usuario.role === 'admin'
                        ? 'bg-[#D4AF37]/10 text-[#D4AF37]'
                        : 'bg-zinc-100 text-zinc-600'
                    }`}
                  >
                    {usuario.role === 'admin' ? 'Admin' : 'Cliente'}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleToggleRole(usuario.id, usuario.role)}
                    disabled={isPending}
                    className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50 disabled:opacity-50"
                  >
                    Tornar {usuario.role === 'admin' ? 'Cliente' : 'Admin'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-zinc-200 bg-white p-12 text-center shadow-sm">
          <p className="text-zinc-400">
            {search
              ? 'Nenhum cliente encontrado com os termos buscados.'
              : 'Nenhum cliente cadastrado.'}
          </p>
        </div>
      )}
    </div>
  )
}
