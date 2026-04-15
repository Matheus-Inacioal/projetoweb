"use client";

import { EstadoCarregando } from "@/componentes/feedback/EstadoCarregando";
import { EstadoErro } from "@/componentes/feedback/EstadoErro";
import { EstadoVazio } from "@/componentes/feedback/EstadoVazio";
import { ListaAgendamentos } from "@/componentes/listas/ListaAgendamentos";
import { CabecalhoPagina } from "@/componentes/ui/CabecalhoPagina";
import { CartaoMetrica } from "@/componentes/ui/CartaoMetrica";
import { usePerfilBarbearia } from "@/hooks/usePerfis";

export default function DashboardBarbeariaPage() {
  const { dados, carregando, erro, recarregar } = usePerfilBarbearia();

  if (carregando) {
    return <EstadoCarregando texto="Carregando dashboard da barbearia..." />;
  }

  if (erro) {
    return <EstadoErro mensagem={erro} onTentarNovamente={() => void recarregar()} />;
  }

  if (!dados) {
    return <EstadoVazio descricao="Nao foi possivel localizar a barbearia." titulo="Painel indisponivel" />;
  }

  if (!dados.barbearia) {
    return (
      <EstadoVazio
        descricao="Cadastre os dados da sua barbearia na aba de perfil para iniciar a operacao do marketplace."
        titulo="Barbearia ainda nao cadastrada"
      />
    );
  }

  return (
    <div className="space-y-6">
      <CabecalhoPagina
        descricao="Visao consolidada da agenda do dia, equipe e servicos da barbearia."
        subtitulo="Prestador PJ"
        titulo="Dashboard da barbearia"
      />

      <div className="grid gap-4 md:grid-cols-4">
        <CartaoMetrica titulo="Barbeiros" valor={dados.barbeiros.length} />
        <CartaoMetrica titulo="Servicos" valor={dados.servicos.length} />
        <CartaoMetrica titulo="Agenda de hoje" valor={dados.agendaHoje.length} />
        <CartaoMetrica titulo="Responsavel" valor={dados.usuario.nome} />
      </div>

      <div className="cartao p-6">
        <h2 className="text-xl font-semibold text-slate-900">{dados.barbearia.nome}</h2>
        <p className="mt-2 text-sm text-slate-600">{dados.barbearia.descricao}</p>
        <p className="mt-2 text-sm text-slate-600">{dados.barbearia.endereco}</p>
      </div>

      {dados.agendaHoje.length ? (
        <ListaAgendamentos agendamentos={dados.agendaHoje} />
      ) : (
        <EstadoVazio descricao="Nenhum agendamento para hoje nesta barbearia." titulo="Agenda de hoje vazia" />
      )}
    </div>
  );
}

