"use client";

import { useParams } from "next/navigation";
import { EstadoCarregando } from "@/componentes/feedback/EstadoCarregando";
import { EstadoErro } from "@/componentes/feedback/EstadoErro";
import { EstadoVazio } from "@/componentes/feedback/EstadoVazio";
import { CartaoBarbeiro } from "@/componentes/listas/CartaoBarbeiro";
import { CabecalhoPagina } from "@/componentes/ui/CabecalhoPagina";
import { useBarbeirosPorBarbearia } from "@/hooks/useBarbeiros";

export default function BarbeirosDaBarbeariaPage() {
  const params = useParams<{ barbeariaId: string }>();
  const { dados, carregando, erro, recarregar } = useBarbeirosPorBarbearia(params.barbeariaId);

  return (
    <div className="container-pagina space-y-6">
      <CabecalhoPagina
        descricao="Selecione o profissional que vai executar o servico desejado."
        subtitulo="Escolha do barbeiro"
        titulo="Barbeiros da barbearia"
      />

      {carregando ? <EstadoCarregando texto="Carregando barbeiros..." /> : null}
      {erro ? <EstadoErro mensagem={erro} onTentarNovamente={() => void recarregar()} /> : null}
      {!carregando && !erro && !dados?.length ? (
        <EstadoVazio descricao="Nao ha barbeiros cadastrados para esta barbearia." titulo="Nenhum barbeiro disponivel" />
      ) : null}

      {dados?.length ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {dados.map((barbeiro) => (
            <CartaoBarbeiro barbeariaId={params.barbeariaId} barbeiro={barbeiro} exibirAcaoAgendar key={barbeiro.id} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

