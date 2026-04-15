"use client";

import { EstadoCarregando } from "@/componentes/feedback/EstadoCarregando";
import { EstadoErro } from "@/componentes/feedback/EstadoErro";
import { EstadoVazio } from "@/componentes/feedback/EstadoVazio";
import { CabecalhoPagina } from "@/componentes/ui/CabecalhoPagina";
import { TabelaDados } from "@/componentes/ui/TabelaDados";
import { IndicadorStatus } from "@/componentes/ui/IndicadorStatus";
import { formatarData, formatarMoeda } from "@/lib/utilitarios/datas";
import { useAgendamentosAdmin } from "@/hooks/useAdmin";

export default function AdminAgendamentosPage() {
  const { dados, carregando, erro, recarregar } = useAgendamentosAdmin();

  return (
    <div className="space-y-6">
      <CabecalhoPagina
        descricao="Visao administrativa dos agendamentos registrados na plataforma."
        subtitulo="Agendamentos"
        titulo="Agendamentos do sistema"
      />

      {carregando ? <EstadoCarregando texto="Carregando agendamentos..." /> : null}
      {erro ? <EstadoErro mensagem={erro} onTentarNovamente={() => void recarregar()} /> : null}
      {!carregando && !erro && !dados?.length ? (
        <EstadoVazio descricao="Nenhum agendamento encontrado." titulo="Lista vazia" />
      ) : null}
      {dados?.length ? (
        <TabelaDados
          colunas={[
            { chave: "contratante", titulo: "Contratante", renderizar: (linha) => linha.contratanteNome },
            { chave: "barbearia", titulo: "Barbearia", renderizar: (linha) => linha.barbeariaNome },
            { chave: "barbeiro", titulo: "Barbeiro", renderizar: (linha) => linha.barbeiroNome },
            { chave: "servico", titulo: "Servico", renderizar: (linha) => `${linha.servicoNome} • ${formatarMoeda(linha.precoServico)}` },
            { chave: "data", titulo: "Data", renderizar: (linha) => `${formatarData(linha.data)} ${linha.hora}` },
            { chave: "status", titulo: "Status", renderizar: (linha) => <IndicadorStatus status={linha.status} /> }
          ]}
          linhas={dados}
        />
      ) : null}
    </div>
  );
}

