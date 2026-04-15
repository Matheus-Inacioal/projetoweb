"use client";

import { EstadoCarregando } from "@/componentes/feedback/EstadoCarregando";
import { EstadoErro } from "@/componentes/feedback/EstadoErro";
import { EstadoVazio } from "@/componentes/feedback/EstadoVazio";
import { ListaAgendamentos } from "@/componentes/listas/ListaAgendamentos";
import { CabecalhoPagina } from "@/componentes/ui/CabecalhoPagina";
import { useAgendamentos } from "@/hooks/useAgendamentos";

export default function AgendaProfissionalPage() {
  const { dados, carregando, erro, recarregar } = useAgendamentos();

  return (
    <div className="space-y-6">
      <CabecalhoPagina
        descricao="Visualize todos os agendamentos vinculados ao seu perfil profissional."
        subtitulo="Agenda"
        titulo="Minha agenda"
      />

      {carregando ? <EstadoCarregando texto="Carregando agenda..." /> : null}
      {erro ? <EstadoErro mensagem={erro} onTentarNovamente={() => void recarregar()} /> : null}
      {!carregando && !erro && !dados?.length ? (
        <EstadoVazio descricao="Nenhum agendamento foi encontrado para este profissional." titulo="Agenda vazia" />
      ) : null}
      {dados?.length ? <ListaAgendamentos agendamentos={dados} /> : null}
    </div>
  );
}

