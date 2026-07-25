import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { logout } from '@/lib/actions/auth'
import MobileNav from './MobileNav'

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
    .select('nome, role')
    .eq('id', data.user.id)
    .single()

  const nome = usuario?.nome || data.user.email?.split('@')[0] || 'Cliente'
  const isAdmin = usuario?.role === 'admin'

  const navLinks = [
    { href: '/dashboard', label: 'Início' },
    { href: '/agendamentos/novo', label: 'Agendamentos' },
    { href: '/agendamentos', label: 'Histórico' },
    { href: '/perfil', label: 'Perfil' },
    ...(isAdmin
      ? [
          { href: '/clientes', label: 'Clientes' },
          { href: '/admin/configuracoes', label: 'Configurações' },
        ]
      : []),
  ]

  return (
    <div className="flex min-h-screen flex-col bg-[#FDFAF8]">
      <header className="sticky top-0 z-50 border-b border-zinc-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <Link
            href="/dashboard"
            className="font-serif text-2xl tracking-tight text-[#D4AF37] transition-opacity hover:opacity-80"
          >
            RBClinic
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition-all duration-200 hover:bg-[#F5E6DF] hover:text-[#C4917B]"
              >
                {link.label}
              </Link>
            ))}

            <div className="mx-2 h-5 w-px bg-zinc-200" />
            <span className="px-2 text-sm font-medium text-zinc-500 hidden lg:inline">{nome}</span>

            <form action={logout}>
              <button
                type="submit"
                className="ml-1 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-600 transition-all duration-200 hover:border-[#E4E4E7] hover:bg-zinc-50 active:scale-[0.98]"
              >
                Sair
              </button>
            </form>
          </nav>

          {/* Mobile nav */}
          <MobileNav navLinks={navLinks} nome={nome} />
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </main>
    </div>
  )
}
