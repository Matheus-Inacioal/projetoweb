"use client";

import { EstadoCarregando } from "@/componentes/feedback/EstadoCarregando";
import { EstadoErro } from "@/componentes/feedback/EstadoErro";
import { EstadoVazio } from "@/componentes/feedback/EstadoVazio";
import { ListaAgendamentos } from "@/componentes/listas/ListaAgendamentos";
import { CabecalhoPagina } from "@/componentes/ui/CabecalhoPagina";
import { usePerfilContratante } from "@/hooks/usePerfis";

export default function MeusAgendamentosPage() {
  const { dados, carregando, erro, recarregar } = usePerfilContratante();

  if (carregando) {
    return <EstadoCarregando texto="Carregando seus agendamentos..." />;
  }

  if (erro) {
    return <EstadoErro mensagem={erro} onTentarNovamente={() => void recarregar()} />;
  }

  if (!dados) {
    return <EstadoVazio descricao="Nao foi possivel localizar seu perfil." titulo="Perfil indisponivel" />;
  }

  return (
    <div className="space-y-8">
      <CabecalhoPagina
        descricao="Visualize os proximos atendimentos e consulte o historico do que ja aconteceu."
        subtitulo="Area do contratante"
        titulo="Meus agendamentos"
      />

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-900">Proximos agendamentos</h2>
        {dados.proximosAgendamentos.length ? (
          <ListaAgendamentos
            agendamentos={dados.proximosAgendamentos}
            onAtualizado={() => void recarregar()}
            permitirCancelamento
          />
        ) : (
          <EstadoVazio
            descricao="Voce ainda nao possui agendamentos futuros confirmados ou pendentes."
            titulo="Nenhum agendamento futuro"
          />
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-900">Historico</h2>
        {dados.historicoAgendamentos.length ? (
          <ListaAgendamentos agendamentos={dados.historicoAgendamentos} />
        ) : (
          <EstadoVazio descricao="Seu historico de atendimentos ainda esta vazio." titulo="Sem historico" />
        )}
      </section>
    </div>
  );
}

