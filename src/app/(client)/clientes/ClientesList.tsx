'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { toggleUserRole } from '@/lib/actions/auth'

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
  created_at: string
}

function formatCpf(cpf: string): string {
  const digits = cpf.replace(/\D/g, '')
  if (digits.length !== 11) return cpf
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 11) {
    return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  }
  if (digits.length === 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  }
  return phone
}

export default function ClientesList({ usuarios }: { usuarios: Usuario[] }) {
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const filtered = usuarios.filter((u) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      u.nome.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.cpf?.includes(q) ||
      u.telefone.includes(q) ||
      u.usuario?.toLowerCase().includes(q) ||
      u.cidade?.toLowerCase().includes(q) ||
      u.bairro?.toLowerCase().includes(q)
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
          placeholder="Buscar por nome, email, CPF, telefone, cidade ou bairro..."
          className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm text-zinc-800 shadow-sm focus:border-[#E1A293] focus:ring-2 focus:ring-[#E1A293]/20 focus:outline-none"
        />
      </div>

      {/* Lista */}
      {filtered.length > 0 ? (
        <div className="space-y-3">
          <p className="text-xs text-zinc-400">
            {filtered.length} cliente{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
          </p>
          {filtered.map((usuario) => {
            const isExpanded = expandedId === usuario.id
            return (
              <div
                key={usuario.id}
                className="rounded-2xl border border-zinc-200 bg-white shadow-sm"
              >
                {/* Cabeçalho do card — sempre visível */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1 min-w-0">
                      <p className="font-semibold text-zinc-800">{usuario.nome}</p>
                      <p className="text-sm text-zinc-500">{usuario.email}</p>
                      <p className="text-sm text-zinc-400">
                        Tel: {formatPhone(usuario.telefone)}
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
                    </div>
                  </div>
                </div>

                {/* Detalhes — expansível */}
                <div className="border-t border-zinc-100 px-5 py-4 space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2 text-sm">
                    <div>
                      <span className="text-zinc-400">Usuário:</span>{' '}
                      <span className="text-zinc-700">{usuario.usuario || '—'}</span>
                    </div>
                    <div>
                      <span className="text-zinc-400">CPF:</span>{' '}
                      <span className="text-zinc-700">{usuario.cpf ? formatCpf(usuario.cpf) : '—'}</span>
                    </div>
                    <div>
                      <span className="text-zinc-400">Nascimento:</span>{' '}
                      <span className="text-zinc-700">
                        {usuario.nascimento
                          ? new Date(usuario.nascimento + 'T00:00:00').toLocaleDateString('pt-BR')
                          : '—'}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-400">Telefone:</span>{' '}
                      <span className="text-zinc-700">{formatPhone(usuario.telefone)}</span>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-zinc-400">Endereço:</span>{' '}
                      <span className="text-zinc-700">
                        {[usuario.endereco, usuario.numero, usuario.bairro, usuario.cidade]
                          .filter(Boolean)
                          .join(', ') || '—'}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-400">Cadastrado em:</span>{' '}
                      <span className="text-zinc-700">
                        {new Date(usuario.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleToggleRole(usuario.id, usuario.role)}
                      disabled={isPending}
                      className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-xs font-medium text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50 disabled:opacity-50"
                    >
                      Tornar {usuario.role === 'admin' ? 'Cliente' : 'Admin'}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
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
