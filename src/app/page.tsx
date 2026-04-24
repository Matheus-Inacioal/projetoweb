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
  const barbeariasRegulares = dados?.filter((b) => !b.destaque) || [];

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primaria via-primaria to-blue-700 px-6 py-16 text-white md:py-24">
        <div className="container-pagina mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-black leading-tight md:text-5xl">
            Encontre a barbearia ideal perto de você
          </h1>
          <p className="mt-4 text-lg text-blue-100 md:text-xl">
            Compare barbearias, escolha seu barbeiro favorito e agende seu horário em poucos cliques.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="#barbearias"
              className="inline-block rounded-lg bg-white px-8 py-3 font-bold text-primaria transition hover:bg-blue-50"
            >
              Ver barbearias
            </Link>
            <Link
              href="/cadastro"
              className="inline-block rounded-lg border-2 border-white px-8 py-3 font-bold text-white transition hover:bg-white hover:bg-opacity-10"
            >
              Agendar agora
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container-pagina space-y-12">
        {/* Barbearias em Destaque */}
        {barbeariasDestaque.length > 0 && (
          <section id="barbearias">
            <CabecalhoPagina
              descricao="As melhores barbearias da região com profissionais altamente qualificados e avaliações excelentes."
              subtitulo="Marketplace"
              titulo="Barbearias em destaque"
            />

            {carregando ? (
              <EstadoCarregando texto="Carregando barbearias em destaque..." />
            ) : erro ? (
              <EstadoErro mensagem={erro} onTentarNovamente={() => void recarregar()} />
            ) : (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                {barbeariasDestaque.map((barbearia) => (
                  <CartaoBarbearia barbearia={barbearia} key={barbearia.id} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Todas as Barbearias */}
        {dados && dados.length > 0 && (
          <section>
            <CabecalhoPagina
              descricao="Confira todas as barbearias cadastradas e escolha a que mais se encaixa no seu estilo."
              subtitulo="Marketplace"
              titulo="Todas as barbearias"
            />

            {carregando ? (
              <EstadoCarregando texto="Carregando barbearias..." />
            ) : erro ? (
              <EstadoErro mensagem={erro} onTentarNovamente={() => void recarregar()} />
            ) : (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
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
      </div>
    </div>
  );
}

