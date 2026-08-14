'use client'

import { useState } from 'react'
import Link from 'next/link'
import { logout } from '@/lib/actions/auth'

interface NavLink {
  href: string
  label: string
}

export default function MobileNav({
  navLinks,
  nome,
}: {
  navLinks: NavLink[]
  nome: string
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center justify-center w-10 h-10 rounded-xl text-zinc-600 hover:bg-zinc-100 transition-colors"
        aria-label="Menu"
      >
        {open ? (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="fixed top-[57px] right-0 z-50 w-72 max-w-[calc(100vw-2rem)] rounded-2xl border border-zinc-200 bg-white p-4 shadow-xl mr-4 mt-2 space-y-1">
            <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
              {nome}
            </p>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="block rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-600 transition-all duration-200 hover:bg-primary-light hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-zinc-100 my-2" />
            <form action={logout}>
              <button
                type="submit"
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm font-medium text-zinc-600 transition-all duration-200 hover:bg-zinc-50 active:scale-[0.98]"
              >
                Sair
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  )
}
