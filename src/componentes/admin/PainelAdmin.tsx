"use client";

import { useBuscarDados } from "@/hooks/useBuscarDados";
import { CartaoMetrica } from "@/componentes/ui/CartaoMetrica";
import { EstadoCarregando } from "@/componentes/feedback/EstadoCarregando";
import { EstadoErro } from "@/componentes/feedback/EstadoErro";
import type { ResumoPainelAdmin } from "@/tipos/dados";

export function PainelAdmin() {
  const { dados: resumo, carregando, erro, recarregar } = useBuscarDados<ResumoPainelAdmin>("/api/admin/resumo");

  if (carregando) return <EstadoCarregando texto="Carregando resumo do sistema..." />;
  if (erro) return <EstadoErro mensagem={erro} onTentarNovamente={recarregar} />;

  return (
    <div className="space-y-8">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <CartaoMetrica
          titulo="Total de Usuários"
          valor={resumo?.totalUsuarios ?? 0}
          detalhe="Contas criadas no sistema"
        />
        <CartaoMetrica
          titulo="Total de Prestadores"
          valor={resumo?.totalPrestadores ?? 0}
          detalhe="Profissionais ativos no marketplace"
        />
        <CartaoMetrica
          titulo="Total de Consumidores"
          valor={resumo?.totalConsumidores ?? 0}
          detalhe="Clientes finais cadastrados"
        />
        <CartaoMetrica
          titulo="Total de Contratações"
          valor={resumo?.totalContratacoes ?? 0}
          detalhe="Agendamentos efetuados"
        />
        <CartaoMetrica
          titulo="Total de Anúncios"
          valor={resumo?.totalAnuncios ?? 0}
          detalhe="Promoções e campanhas veiculadas"
        />
      </div>
    </div>
  );
}
