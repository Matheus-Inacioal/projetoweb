"use client";

import { EstadoCarregando } from "@/componentes/feedback/EstadoCarregando";
import { EstadoErro } from "@/componentes/feedback/EstadoErro";
import { EstadoVazio } from "@/componentes/feedback/EstadoVazio";
import { ListaAgendamentos } from "@/componentes/listas/ListaAgendamentos";
import { CabecalhoPagina } from "@/componentes/ui/CabecalhoPagina";
import { useAgendamentos } from "@/hooks/useAgendamentos";

export default function AgendaBarbeariaPage() {
  const { dados, carregando, erro, recarregar } = useAgendamentos();

  return (
    <div className="space-y-6">
      <CabecalhoPagina
        descricao="Agenda geral da barbearia com todos os atendimentos vinculados ao estabelecimento."
        subtitulo="Agenda geral"
        titulo="Agenda da barbearia"
      />

      {carregando ? <EstadoCarregando texto="Carregando agenda geral..." /> : null}
      {erro ? <EstadoErro mensagem={erro} onTentarNovamente={() => void recarregar()} /> : null}
      {!carregando && !erro && !dados?.length ? (
        <EstadoVazio descricao="Nao ha agendamentos cadastrados para esta barbearia." titulo="Agenda vazia" />
      ) : null}
      {dados?.length ? <ListaAgendamentos agendamentos={dados} /> : null}
    </div>
  );
}

