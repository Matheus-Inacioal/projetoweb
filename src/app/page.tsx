import Link from "next/link";
import { obterSessaoAtual } from "@/lib/autenticacao/sessao";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const sessao = await obterSessaoAtual();

  return (
    <div className="space-y-0">
      {/* Hero Section Premium */}
      <section className="relative overflow-hidden bg-gradient-to-br from-verde_petroleo via-verde_escuro to-verde_petroleo px-6 py-24 md:py-32 text-off_white">
        {/* Decoração de fundo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-dourado rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-dourado rounded-full blur-3xl"></div>
        </div>

        <div className="container-pagina relative z-10 mx-auto max-w-4xl text-center">
          <p className="texto-destaque mb-4 inline-block">MARKETPLACE PREMIUM DE PRESTADORES</p>

          <h1 className="font-serif text-5xl md:text-6xl font-black leading-tight mb-6">
            Conectando você aos melhores barbeiros e profissionais.
          </h1>

          <p className="text-lg md:text-xl text-off_white/90 mb-10 leading-relaxed max-w-2xl mx-auto">
            Escolha seu prestador favorito, agende um horário exclusivo e tenha uma experiência personalizada sob medida.
          </p>

          {sessao ? (
            <div className="space-y-4">
              <p className="text-lg text-marfim">
                Bem-vindo de volta, <span className="font-bold">{sessao.nome}</span>!
              </p>
              <div className="flex justify-center">
                <Link
                  href="/dashboard"
                  className="botao-premium inline-block px-8 py-4 text-base hover:shadow-premium"
                >
                  Acessar Meu Painel
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/login"
                className="botao-primario inline-block px-8 py-4 text-base hover:shadow-premium"
              >
                Acessar Conta
              </Link>
              <Link
                href="/cadastro"
                className="botao-premium inline-block px-8 py-4 text-base hover:shadow-premium"
              >
                Cadastrar-se Agora
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Características do Marketplace */}
      <section className="py-20 bg-white">
        <div className="container-pagina max-w-5xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-serif font-bold text-texto_principal">Por que usar o BarberGo?</h2>
            <p className="text-texto_secundario mt-2">Uma plataforma moderna, segura e rápida para agendamentos acadêmicos.</p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="cartao p-6 border border-bege_borda text-center space-y-4 bg-marfim">
              <div className="text-3xl">📅</div>
              <h3 className="text-lg font-bold text-texto_principal">Agenda em Tempo Real</h3>
              <p className="text-xs text-texto_secundario leading-relaxed">
                Prestadores gerenciam horários de forma flexível. Consumidores veem disponibilidades instantâneas e agendam em poucos cliques.
              </p>
            </div>

            <div className="cartao p-6 border border-bege_borda text-center space-y-4 bg-marfim">
              <div className="text-3xl">❤️</div>
              <h3 className="text-lg font-bold text-texto_principal">Favoritos & Avaliações</h3>
              <p className="text-xs text-texto_secundario leading-relaxed">
                Adicione prestadores aos seus favoritos e tenha acesso rápido para os próximos agendamentos de corte ou barba.
              </p>
            </div>

            <div className="cartao p-6 border border-bege_borda text-center space-y-4 bg-marfim">
              <div className="text-3xl">📢</div>
              <h3 className="text-lg font-bold text-texto_principal">Anúncios & Ofertas</h3>
              <p className="text-xs text-texto_secundario leading-relaxed">
                Prestadores divulgam promoções especiais de forma destacada diretamente no perfil para atrair e reter mais clientes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="container-pagina py-12">
        <div className="rounded-2xl bg-gradient-to-r from-verde_petroleo to-verde_escuro px-8 py-16 text-center text-off_white">
          <h3 className="font-serif text-3xl font-bold mb-4">Pronto para começar?</h3>
          <p className="text-lg text-off_white/90 mb-8 max-w-lg mx-auto">
            Crie sua conta como consumidor para encontrar barbeiros ou como prestador para impulsionar seus agendamentos.
          </p>
          <Link href="/cadastro" className="botao-premium inline-block px-8 py-4 text-base">
            Criar Conta Grátis
          </Link>
        </div>
      </section>
    </div>
  );
}
