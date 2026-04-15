"use client";

import { EstadoCarregando } from "@/componentes/feedback/EstadoCarregando";
import { EstadoErro } from "@/componentes/feedback/EstadoErro";
import { EstadoVazio } from "@/componentes/feedback/EstadoVazio";
import { ListaAgendamentos } from "@/componentes/listas/ListaAgendamentos";
import { CabecalhoPagina } from "@/componentes/ui/CabecalhoPagina";
import { CartaoMetrica } from "@/componentes/ui/CartaoMetrica";
import { usePerfilProfissional } from "@/hooks/usePerfis";

export default function DashboardProfissionalPage() {
  const { dados, carregando, erro, recarregar } = usePerfilProfissional();

  if (carregando) {
    return <EstadoCarregando texto="Carregando dashboard profissional..." />;
  }

  if (erro) {
    return <EstadoErro mensagem={erro} onTentarNovamente={() => void recarregar()} />;
  }

  if (!dados) {
    return <EstadoVazio descricao="Nao foi possivel localizar seu perfil profissional." titulo="Perfil indisponivel" />;
  }

  return (
    <div className="space-y-6">
      <CabecalhoPagina
        descricao="Resumo do dia para o barbeiro, com agenda atual e disponibilidade cadastrada."
        subtitulo="Prestador PF"
        titulo="Dashboard profissional"
      />

      <div className="grid gap-4 md:grid-cols-3">
        <CartaoMetrica titulo="Agenda de hoje" valor={dados.agendaHoje.length} />
        <CartaoMetrica titulo="Disponibilidades" valor={dados.disponibilidades.length} />
        <CartaoMetrica titulo="Status do perfil" valor={dados.barbeiro ? "Ativo" : "Pendente"} />
      </div>

      {dados.barbeiro ? (
        <div className="cartao p-6">
          <h2 className="text-xl font-semibold text-slate-900">{dados.barbeiro.nome}</h2>
          <p className="mt-2 text-sm text-slate-600">{dados.barbeiro.especialidade}</p>
          <p className="mt-2 text-sm text-slate-600">{dados.barbeiro.descricao}</p>
        </div>
      ) : (
        <EstadoVazio
          descricao="Complete seu perfil profissional na aba correspondente para aparecer como barbeiro no sistema."
          titulo="Perfil profissional ainda nao configurado"
        />
      )}

      {dados.agendaHoje.length ? (
        <ListaAgendamentos agendamentos={dados.agendaHoje} />
      ) : (
        <EstadoVazio descricao="Nao ha atendimentos agendados para hoje." titulo="Agenda de hoje vazia" />
      )}
    </div>
  );
}

