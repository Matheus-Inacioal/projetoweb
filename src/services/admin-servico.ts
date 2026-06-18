import { criarClienteSupabaseServidor } from "@/lib/banco/supabase-server";
import { ErroAplicacao } from "@/lib/utilitarios/erro-aplicacao";

export const adminServico = {
  async obterResumoPainel() {
    const supabase = criarClienteSupabaseServidor();
    const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

    const [
      usuariosRes,
      prestadoresRes,
      consumidoresRes,
      servicosRes,
      produtosRes,
      anunciosRes,
      agendamentosRes,
      pagamentosAprovadosRes,
      pagamentosPendentesRes,
      pagamentosProdutosAprovadosRes,
      pagamentosProdutosPendentesRes,
      pagamentosMesRes,
      pagamentosProdutosMesRes
    ] = await Promise.all([
      supabase.from("usuarios").select("*", { count: "exact", head: true }),
      supabase.from("prestadores").select("*", { count: "exact", head: true }),
      supabase.from("consumidores").select("*", { count: "exact", head: true }),
      supabase.from("servicos").select("*", { count: "exact", head: true }),
      supabase.from("produtos").select("*", { count: "exact", head: true }),
      supabase.from("anuncios").select("*", { count: "exact", head: true }),
      supabase.from("agendamentos").select("*", { count: "exact", head: true }),
      supabase.from("pagamentos").select("valor").eq("status", "aprovado"),
      supabase.from("pagamentos").select("id", { count: "exact", head: true }).eq("status", "pendente"),
      supabase.from("pagamentos_produtos").select("valor").eq("status", "aprovado"),
      supabase.from("pagamentos_produtos").select("id", { count: "exact", head: true }).eq("status", "pendente"),
      supabase.from("pagamentos").select("valor").eq("status", "aprovado").gte("created_at", firstDayOfMonth),
      supabase.from("pagamentos_produtos").select("valor").eq("status", "aprovado").gte("created_at", firstDayOfMonth)
    ]);

    const errors = [
      usuariosRes.error,
      prestadoresRes.error,
      consumidoresRes.error,
      servicosRes.error,
      produtosRes.error,
      anunciosRes.error,
      agendamentosRes.error,
      pagamentosAprovadosRes.error,
      pagamentosPendentesRes.error,
      pagamentosProdutosAprovadosRes.error,
      pagamentosProdutosPendentesRes.error,
      pagamentosMesRes.error,
      pagamentosProdutosMesRes.error
    ].filter(Boolean);

    if (errors.length > 0) {
      console.error("Erro ao buscar dados do painel:", errors);
      throw new ErroAplicacao(errors[0]?.message || "Erro ao buscar resumo do painel.", 400);
    }

    const somarValores = (dados: { valor: any }[] | null) => {
      if (!dados) return 0;
      return dados.reduce((acc, curr) => acc + Number(curr.valor || 0), 0);
    };

    const receitaServicosTotal = somarValores(pagamentosAprovadosRes.data);
    const receitaProdutosTotal = somarValores(pagamentosProdutosAprovadosRes.data);
    const receitaTotal = receitaServicosTotal + receitaProdutosTotal;

    const receitaServicosMes = somarValores(pagamentosMesRes.data);
    const receitaProdutosMes = somarValores(pagamentosProdutosMesRes.data);
    const receitaMes = receitaServicosMes + receitaProdutosMes;

    const pixPagos = (pagamentosAprovadosRes.data?.length ?? 0) + (pagamentosProdutosAprovadosRes.data?.length ?? 0);
    const pixPendentes = (pagamentosPendentesRes.count ?? 0) + (pagamentosProdutosPendentesRes.count ?? 0);
    const totalPagamentos = pixPagos + pixPendentes;

    const ticketMedio = pixPagos > 0 ? receitaTotal / pixPagos : 0;

    return {
      totalUsuarios: usuariosRes.count ?? 0,
      totalPrestadores: prestadoresRes.count ?? 0,
      totalConsumidores: consumidoresRes.count ?? 0,
      totalServicos: servicosRes.count ?? 0,
      totalProdutos: produtosRes.count ?? 0,
      totalContratacoes: agendamentosRes.count ?? 0,
      totalAnuncios: anunciosRes.count ?? 0,
      totalPagamentos,
      receitaTotal,
      receitaMes,
      ticketMedio,
      quantidadePixPagos: pixPagos,
      quantidadePixPendentes: pixPendentes
    };
  }
};
