"use client";

import { useBuscarDados } from "@/hooks/useBuscarDados";
import { CartaoMetrica } from "@/componentes/ui/CartaoMetrica";
import { EstadoCarregando } from "@/componentes/feedback/EstadoCarregando";
import { EstadoErro } from "@/componentes/feedback/EstadoErro";
import { GraficosResumo } from "@/componentes/admin/GraficosResumo";
import type { ResumoPainelAdmin } from "@/tipos/dados";

export function PainelAdmin() {
  const { dados: resumo, carregando, erro, recarregar } = useBuscarDados<ResumoPainelAdmin>("/api/admin/resumo");

  if (carregando) return <EstadoCarregando texto="Carregando resumo do sistema..." />;
  if (erro) return <EstadoErro mensagem={erro} onTentarNovamente={recarregar} />;

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(valor);
  };

  return (
    <div className="space-y-10">
      {/* Indicadores Financeiros */}
      <div>
        <h2 className="text-xl font-serif font-bold text-verde_escuro mb-4 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-dourado rounded-full block" />
          Indicadores Financeiros
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <CartaoMetrica
            titulo="Receita Total"
            valor={formatarMoeda(resumo?.receitaTotal ?? 0)}
            detalhe="Faturamento geral aprovado"
          />
          <CartaoMetrica
            titulo="Receita do Mês"
            valor={formatarMoeda(resumo?.receitaMes ?? 0)}
            detalhe="Mês atual consolidado"
          />
          <CartaoMetrica
            titulo="Ticket Médio"
            valor={formatarMoeda(resumo?.ticketMedio ?? 0)}
            detalhe="Faturamento por venda aprovada"
          />
          <CartaoMetrica
            titulo="PIX Pagos"
            valor={`${resumo?.quantidadePixPagos ?? 0} unidades`}
            detalhe="Transações concluídas"
          />
          <CartaoMetrica
            titulo="PIX Pendentes"
            valor={`${resumo?.quantidadePixPendentes ?? 0} unidades`}
            detalhe="Transações em aberto"
          />
        </div>
      </div>

      {/* Métricas Operacionais */}
      <div>
        <h2 className="text-xl font-serif font-bold text-verde_escuro mb-4 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-dourado rounded-full block" />
          Métricas Gerais
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <CartaoMetrica
            titulo="Total de Usuários"
            valor={resumo?.totalUsuarios ?? 0}
            detalhe="Contas cadastradas"
          />
          <CartaoMetrica
            titulo="Total de Prestadores"
            valor={resumo?.totalPrestadores ?? 0}
            detalhe="Profissionais parceiros"
          />
          <CartaoMetrica
            titulo="Total de Consumidores"
            valor={resumo?.totalConsumidores ?? 0}
            detalhe="Clientes finais cadastrados"
          />
          <CartaoMetrica
            titulo="Total de Serviços"
            valor={resumo?.totalServicos ?? 0}
            detalhe="Opções de serviço catalogadas"
          />
          <CartaoMetrica
            titulo="Total de Produtos"
            valor={resumo?.totalProdutos ?? 0}
            detalhe="Produtos cadastrados"
          />
          <CartaoMetrica
            titulo="Contratações"
            valor={resumo?.totalContratacoes ?? 0}
            detalhe="Agendamentos efetuados"
          />
          <CartaoMetrica
            titulo="Pagamentos"
            valor={resumo?.totalPagamentos ?? 0}
            detalhe="Transações totais geradas"
          />
          <CartaoMetrica
            titulo="Total de Anúncios"
            valor={resumo?.totalAnuncios ?? 0}
            detalhe="Campanhas de marketing"
          />
        </div>
      </div>

      {/* Seção de Gráficos Recharts */}
      <div>
        <h2 className="text-xl font-serif font-bold text-verde_escuro mb-6 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-dourado rounded-full block" />
          Painel Estatístico de Vendas e Crescimento
        </h2>
        {resumo && <GraficosResumo dados={resumo} />}
      </div>
    </div>
  );
}
