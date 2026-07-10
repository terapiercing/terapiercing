import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { logout } from '@/lib/actions/auth'

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()

  if (!data?.user) {
    redirect('/login')
  }

  const { data: usuario } = await supabase
    .from('usuarios')
    .select('nome')
    .eq('id', data.user.id)
    .single()

  const nome = usuario?.nome || data.user.email?.split('@')[0] || 'Cliente'

  return (
    <div className="flex min-h-screen flex-col bg-[#FAF7F5]">
      <header className="border-b border-zinc-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
    <Link
          href="/dashboard"
          className="font-serif text-2xl tracking-tight text-[#D4AF37]"
        >
          RBClinic
        </Link>

          <nav className="flex items-center gap-6">
            <Link
              href="/dashboard"
              className="text-sm font-medium text-zinc-600 transition-colors hover:text-[#E1A293]"
            >
              Início
            </Link>
            <Link
              href="/agendamentos"
              className="text-sm font-medium text-zinc-600 transition-colors hover:text-[#E1A293]"
            >
              Agendamentos
            </Link>
            <Link
              href="/perfil"
              className="text-sm font-medium text-zinc-600 transition-colors hover:text-[#E1A293]"
            >
              Perfil
            </Link>

            <span className="text-sm text-zinc-400">|</span>
            <span className="text-sm text-zinc-500">{nome}</span>

            <form action={logout}>
              <button
                type="submit"
                className="rounded-lg bg-[#E1A293] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#d48d7c]"
              >
                Sair
              </button>
            </form>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
        {children}
      </main>
    </div>
  )
}
