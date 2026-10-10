import Link from "next/link";
import { createClient } from '@/lib/supabase/server'
import { getConfiguracao } from '@/lib/config'

export default async function Home() {
  const supabase = await createClient()
  const config = await getConfiguracao()
  const { data: servicos } = await supabase
    .from('servicos')
    .select('id, nome, duracao_min, preco')
    .eq('ativo', true)
    .order('nome')

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 border-b border-zinc-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="font-serif text-2xl tracking-tight text-secondary">
            {config.nomeClinica}
          </span>
          <nav className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-600 transition-all duration-200 hover:bg-zinc-50 active:scale-[0.98] sm:px-5 sm:py-2.5"
            >
              Já sou cliente
            </Link>
            <Link
              href="/cadastro"
              className="rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-primary-dark active:scale-[0.98] sm:px-5 sm:py-2.5"
            >
              Cadastre-se
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 items-center px-4 py-10 sm:px-6 sm:py-16">
        <div className="flex flex-col items-center gap-16 text-center lg:flex-row lg:text-left w-full">
          <div className="flex-1 space-y-8">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
                Piercing • Estilo • Personalidade
              </p>
              <h1 className="font-serif text-4xl leading-tight tracking-tight text-zinc-800 sm:text-5xl lg:text-6xl">
                Sua beleza merece um toque de{" "}
                <span className="text-secondary">personalidade</span>.
              </h1>
            </div>
            <p className="max-w-lg text-base leading-relaxed text-zinc-500 mx-auto lg:mx-0 sm:text-lg">
              Realce seu estilo com piercings que combinam com você. Agende seu
              atendimento e acompanhe seus procedimentos em um só lugar.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 lg:justify-start">
              <Link
                href="/cadastro"
                className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-primary-dark active:scale-[0.98] sm:px-8 sm:py-3.5"
              >
                Cadastre-se
              </Link>
              <Link
                href="/login"
                className="rounded-xl border border-zinc-200 bg-white px-6 py-3 text-sm font-semibold text-zinc-600 shadow-sm transition-all duration-200 hover:bg-zinc-50 active:scale-[0.98] sm:px-8 sm:py-3.5"
              >
                Já sou cliente
              </Link>
            </div>
          </div>

          <div className="flex-1 w-full lg:max-w-xl">
            <h3 className="font-serif text-2xl text-zinc-800 text-center lg:text-left mb-3">
              Nossos Serviços
            </h3>
            <p className="text-sm text-zinc-400 text-center lg:text-left mb-6">
              Clique em um serviço para agendar seu horário
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {servicos && servicos.length > 0 ? (
                servicos.map((servico) => (
                  <Link
                    key={servico.id}
                    href={`/agendamentos/novo?serviceId=${servico.id}`}
                    className="group flex flex-col rounded-2xl border border-zinc-200 bg-white p-5 text-center shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all duration-300 hover:border-primary/30 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] active:scale-[0.98]"
                  >
                    <p className="font-medium text-zinc-800 transition-colors duration-200 group-hover:text-primary">
                      {servico.nome}
                    </p>
                    <p className="mt-1 text-sm text-zinc-400">
                      {servico.duracao_min} min
                    </p>
                    <p className="mt-2 text-xs font-semibold text-secondary">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(servico.preco)}
                    </p>
                  </Link>
                ))
              ) : (
                <div className="col-span-2 rounded-2xl border-2 border-dashed border-zinc-200 p-10 text-center bg-white">
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
