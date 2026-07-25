'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { toggleUserRole } from '@/lib/actions/auth'
import EditarUsuarioModal from './EditarUsuarioModal'
import HistoricoClienteModal from './HistoricoClienteModal'

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
  const [editingUser, setEditingUser] = useState<Usuario | null>(null)
  const [historyUser, setHistoryUser] = useState<Usuario | null>(null)
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
        <div />
        <Link
          href="/clientes/novo"
          className="inline-flex justify-center items-center rounded-xl bg-[#C4917B] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#A87060] active:scale-[0.98]"
        >
          Novo Cliente
        </Link>
      </div>

      {/* Busca */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome, email, CPF, telefone, cidade ou bairro..."
          className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm text-zinc-800 shadow-sm transition-all duration-200 focus:border-[#C4917B] focus:ring-2 focus:ring-[#C4917B]/15 focus:outline-none"
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
              className="rounded-2xl border border-zinc-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
            >
              {/* Cabeçalho do card */}
              <div className="p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <p className="font-semibold text-zinc-800 truncate">{usuario.nome}</p>
                    <p className="text-sm text-zinc-500 truncate">{usuario.email}</p>
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

              {/* Detalhes */}
              <div className="border-t border-zinc-100 px-4 py-3 sm:px-5 sm:py-4 space-y-4">
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

                <div className="flex flex-wrap justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setHistoryUser(usuario)}
                    className="rounded-xl bg-[#C4917B]/10 px-4 py-2 text-xs font-medium text-[#C4917B] shadow-sm transition-all duration-200 hover:bg-[#C4917B]/20 active:scale-[0.98]"
                  >
                    Histórico
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingUser(usuario)}
                    className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs font-medium text-zinc-700 shadow-sm transition-all duration-200 hover:bg-zinc-50 active:scale-[0.98]"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleRole(usuario.id, usuario.role)}
                    disabled={isPending}
                    className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs font-medium text-zinc-700 shadow-sm transition-all duration-200 hover:bg-zinc-50 active:scale-[0.98] disabled:opacity-50"
                  >
                    Tornar {usuario.role === 'admin' ? 'Cliente' : 'Admin'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-zinc-200 bg-white p-12 text-center shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <p className="text-zinc-400">
            {search
              ? 'Nenhum cliente encontrado com os termos buscados.'
              : 'Nenhum cliente cadastrado.'}
          </p>
        </div>
      )}

      {/* Modal de edição */}
      {editingUser && (
        <EditarUsuarioModal
          usuario={editingUser}
          onClose={() => setEditingUser(null)}
        />
      )}

      {/* Modal de histórico */}
      {historyUser && (
        <HistoricoClienteModal
          patientId={historyUser.id}
          patientName={historyUser.nome}
          onClose={() => setHistoryUser(null)}
        />
      )}
    </div>
  )
}
