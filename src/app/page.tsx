import Link from "next/link";
import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = await createClient()
  const { data: servicos } = await supabase
    .from('servicos')
    .select('id, nome, duracao_min, preco')
    .eq('ativo', true)
    .order('nome')

  return (
    <div className="flex min-h-screen flex-col bg-[#FAF7F5]">
      <header className="border-b border-zinc-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="font-serif text-2xl tracking-tight text-[#D4AF37]">
            RBClinic
          </span>
          <nav className="flex items-center gap-4">
            <Link
              href="/login"
              className="rounded-lg border border-zinc-300 bg-white px-5 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
            >
              Já sou cliente
            </Link>
            <Link
              href="/cadastro"
              className="rounded-lg bg-[#E1A293] px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-[#d48d7c]"
            >
              Cadastre-se
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 items-center px-6 py-12">
        <div className="flex flex-col items-center gap-12 text-center lg:flex-row lg:text-left w-full">
          <div className="flex-1 space-y-6">
            <h1 className="font-serif text-5xl leading-tight tracking-tight text-zinc-800 lg:text-6xl">
              Sua beleza merece{" "}
              <span className="text-[#D4AF37]">cuidado</span>{" "}
              <span className="text-[#E1A293]">especial</span>
            </h1>
            <p className="max-w-lg text-lg leading-relaxed text-zinc-500 mx-auto lg:mx-0">
              Agende seus horários, acompanhe seus tratamentos e tenha acesso a
              todo o histórico de procedimentos estéticos em um só lugar.
            </p>
            <div className="flex justify-center gap-4 lg:justify-start">
              <Link
                href="/cadastro"
                className="rounded-lg bg-[#E1A293] px-8 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#d48d7c]"
              >
                Cadastre-se
              </Link>
              <Link
                href="/login"
                className="rounded-lg border border-zinc-300 bg-white px-8 py-3 text-sm font-semibold text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50"
              >
                Já sou cliente
              </Link>
            </div>
          </div>

          <div className="flex-1 w-full lg:max-w-xl">
            <h3 className="font-serif text-2xl text-zinc-800 text-center lg:text-left mb-6">
              Nossos Serviços & Procedimentos
            </h3>
            <p className="text-sm text-zinc-400 text-center lg:text-left mb-4">
              Clique em um serviço abaixo para realizar o agendamento de seu horário:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {servicos && servicos.length > 0 ? (
                servicos.map((servico) => (
                  <Link
                    key={servico.id}
                    href={`/agendamentos/novo?serviceId=${servico.id}`}
                    className="flex flex-col items-center justify-center rounded-2xl border border-zinc-200 bg-white p-5 text-center shadow-sm transition-all hover:border-[#E1A293] hover:shadow-md active:scale-[0.98] group"
                  >
                    <p className="font-medium text-zinc-800 group-hover:text-[#E1A293] transition-colors">
                      {servico.nome}
                    </p>
                    <p className="mt-1 text-sm text-zinc-400">
                      {servico.duracao_min} min
                    </p>
                    <p className="mt-2 text-xs font-semibold text-[#D4AF37]">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(servico.preco)}
                    </p>
                  </Link>
                ))
              ) : (
                <div className="col-span-2 rounded-2xl border border-dashed border-zinc-300 p-8 text-center bg-white">
                  <p className="text-sm text-zinc-400">Nenhum serviço disponível no momento.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
