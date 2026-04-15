"use client";

import { CartaoBarbearia } from "@/componentes/listas/CartaoBarbearia";
import { EstadoCarregando } from "@/componentes/feedback/EstadoCarregando";
import { EstadoErro } from "@/componentes/feedback/EstadoErro";
import { EstadoVazio } from "@/componentes/feedback/EstadoVazio";
import { CabecalhoPagina } from "@/componentes/ui/CabecalhoPagina";
import { CartaoMetrica } from "@/componentes/ui/CartaoMetrica";
import { useBarbearias } from "@/hooks/useBarbearias";

export default function Home() {
  const { dados, carregando, erro, recarregar } = useBarbearias();

  return (
    <div className="container-pagina space-y-8">
      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="cartao space-y-4 p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-destaque">BarberGo MVP</p>
          <h1 className="max-w-3xl text-4xl font-black leading-tight text-slate-900">
            Agendamento academico para clientes, barbeiros, barbearias e administradores.
          </h1>
          <p className="max-w-2xl text-sm text-slate-600">
            Explore barbearias, selecione barbeiros, escolha servicos e acompanhe agendas em uma plataforma simples,
            organizada e pronta para rodar localmente.
          </p>
        </div>

        <div className="grid gap-4">
          <CartaoMetrica detalhe="Marketplace pronto para demonstracao local" titulo="Stack" valor="Next + Prisma" />
          <CartaoMetrica detalhe="Perfis suportados no MVP academico" titulo="Usuarios" valor="4 perfis" />
          <CartaoMetrica detalhe="Fluxo principal com cadastro, login e agenda" titulo="Cobertura" valor="MVP funcional" />
        </div>
      </section>

      <section className="space-y-6">
        <CabecalhoPagina
          descricao="Escolha uma barbearia para visualizar detalhes, profissionais e iniciar um agendamento."
          subtitulo="Marketplace"
          titulo="Barbearias em destaque"
        />

        {carregando ? <EstadoCarregando texto="Buscando barbearias cadastradas..." /> : null}
        {erro ? <EstadoErro mensagem={erro} onTentarNovamente={() => void recarregar()} /> : null}
        {!carregando && !erro && !dados?.length ? (
          <EstadoVazio descricao="Cadastre a primeira barbearia para iniciar a vitrine publica." titulo="Nenhuma barbearia cadastrada" />
        ) : null}

        {dados?.length ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {dados.map((barbearia) => (
              <CartaoBarbearia barbearia={barbearia} key={barbearia.id} />
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}

