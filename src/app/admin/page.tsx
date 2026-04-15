"use client";

import { EstadoCarregando } from "@/componentes/feedback/EstadoCarregando";
import { EstadoErro } from "@/componentes/feedback/EstadoErro";
import { EstadoVazio } from "@/componentes/feedback/EstadoVazio";
import { CabecalhoPagina } from "@/componentes/ui/CabecalhoPagina";
import { CartaoMetrica } from "@/componentes/ui/CartaoMetrica";
import { useResumoAdmin } from "@/hooks/useAdmin";

export default function AdminDashboardPage() {
  const { dados, carregando, erro, recarregar } = useResumoAdmin();

  if (carregando) {
    return <EstadoCarregando texto="Carregando indicadores administrativos..." />;
  }

  if (erro) {
    return <EstadoErro mensagem={erro} onTentarNovamente={() => void recarregar()} />;
  }

  if (!dados) {
    return <EstadoVazio descricao="Nao foi possivel carregar os indicadores." titulo="Resumo indisponivel" />;
  }

  return (
    <div className="space-y-6">
      <CabecalhoPagina
        descricao="Painel administrativo basico para acompanhar usuarios, barbearias e agendamentos do BarberGo."
        subtitulo="Administracao"
        titulo="Dashboard administrativo"
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <CartaoMetrica titulo="Usuarios" valor={dados.totalUsuarios} />
        <CartaoMetrica titulo="Barbearias" valor={dados.totalBarbearias} />
        <CartaoMetrica titulo="Agendamentos" valor={dados.totalAgendamentos} />
        <CartaoMetrica titulo="Pendentes" valor={dados.agendamentosPendentes} />
        <CartaoMetrica titulo="Confirmados" valor={dados.agendamentosConfirmados} />
      </div>
    </div>
  );
}

