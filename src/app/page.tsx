"use client";

import Link from "next/link";
import { CartaoBarbearia } from "@/componentes/listas/CartaoBarbearia";
import { EstadoCarregando } from "@/componentes/feedback/EstadoCarregando";
import { EstadoErro } from "@/componentes/feedback/EstadoErro";
import { EstadoVazio } from "@/componentes/feedback/EstadoVazio";
import { CabecalhoPagina } from "@/componentes/ui/CabecalhoPagina";
import { useBarbearias } from "@/hooks/useBarbearias";

export default function Home() {
  const { dados, carregando, erro, recarregar } = useBarbearias();

  // Filtrar barbearias em destaque
  const barbeariasDestaque = dados?.filter((b) => b.destaque) || [];

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
          <p className="texto-destaque mb-4 inline-block">MARKETPLACE PREMIUM</p>

          <h1 className="font-serif text-5xl md:text-6xl font-black leading-tight mb-6">
            Barbearias premium, horários exclusivos.
          </h1>

          <p className="text-lg md:text-xl text-off_white/90 mb-10 leading-relaxed max-w-2xl mx-auto">
            Escolha a barbearia, selecione seu barbeiro e agende uma experiência sob medida. Profissionais verificados e serviços de qualidade.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="#barbearias"
              className="botao-primario inline-block px-8 py-4 text-base hover:shadow-premium"
            >
              Encontrar barbearias
            </Link>
            <Link
              href="/cadastro"
              className="botao-premium inline-block px-8 py-4 text-base hover:shadow-premium"
            >
              Agendar agora
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container-pagina space-y-16">
        {/* Barbearias em Destaque */}
        {barbeariasDestaque.length > 0 && (
          <section id="barbearias" className="scroll-mt-20">
            <div className="mb-12">
              <p className="texto-destaque mb-3">SELEÇÃO EXCLUSIVA</p>
              <h2 className="titulo-secao mb-3">Barbearias premium em destaque</h2>
              <p className="text-texto_secundario text-lg max-w-2xl">
                As melhores barbearias da região com profissionais altamente qualificados, ambiente sofisticado e serviços premium.
              </p>
            </div>

            {carregando ? (
              <EstadoCarregando texto="Carregando barbearias premium..." />
            ) : erro ? (
              <EstadoErro mensagem={erro} onTentarNovamente={() => void recarregar()} />
            ) : (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                {barbeariasDestaque.map((barbearia) => (
                  <CartaoBarbearia barbearia={barbearia} key={barbearia.id} premium />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Todas as Barbearias */}
        {dados && dados.length > 0 && (
          <section>
            <div className="mb-12">
              <p className="texto-destaque mb-3">MARKETPLACE</p>
              <h2 className="titulo-secao mb-3">Todas as barbearias parceiras</h2>
              <p className="text-texto_secundario text-lg max-w-2xl">
                Confira todas as barbearias cadastradas e escolha a que mais se encaixa no seu estilo e localização.
              </p>
            </div>

            {carregando ? (
              <EstadoCarregando texto="Carregando barbearias..." />
            ) : erro ? (
              <EstadoErro mensagem={erro} onTentarNovamente={() => void recarregar()} />
            ) : (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {dados.map((barbearia) => (
                  <CartaoBarbearia barbearia={barbearia} key={barbearia.id} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Estado Vazio */}
        {!carregando && !erro && !dados?.length && (
          <EstadoVazio
            descricao="Cadastre a primeira barbearia para iniciar a vitrine pública."
            titulo="Nenhuma barbearia cadastrada"
          />
        )}

        {/* CTA Final */}
        <section className="py-12">
          <div className="rounded-2xl bg-gradient-to-r from-verde_petroleo to-verde_escuro px-8 py-16 text-center text-off_white">
            <h3 className="font-serif text-3xl font-bold mb-4">Pronto para agendar?</h3>
            <p className="text-lg text-off_white/90 mb-8">
              Escolha sua barbearia favorita e reserve seu horário em alguns cliques.
            </p>
            <Link href="/cadastro" className="botao-premium inline-block px-8 py-4 text-base">
              Começar agendamento
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

