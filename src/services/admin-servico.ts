import { criarClienteSupabaseServidor } from "@/lib/banco/supabase-server";
import { ErroAplicacao } from "@/lib/utilitarios/erro-aplicacao";

export const adminServico = {
  async obterResumoPainel() {
    const supabase = criarClienteSupabaseServidor();

    const [
      usuariosRes,
      prestadoresRes,
      consumidoresRes,
      contratacoesRes,
      anunciosRes
    ] = await Promise.all([
      supabase.from("usuarios").select("*", { count: "exact", head: true }),
      supabase.from("prestadores").select("*", { count: "exact", head: true }),
      supabase.from("consumidores").select("*", { count: "exact", head: true }),
      supabase.from("agendamentos").select("*", { count: "exact", head: true }),
      supabase.from("anuncios").select("*", { count: "exact", head: true })
    ]);

    if (
      usuariosRes.error ||
      prestadoresRes.error ||
      consumidoresRes.error ||
      contratacoesRes.error ||
      anunciosRes.error
    ) {
      const err = usuariosRes.error || prestadoresRes.error || consumidoresRes.error || contratacoesRes.error || anunciosRes.error;
      throw new ErroAplicacao(err?.message || "Erro ao buscar resumo do painel.", 400);
    }

    return {
      totalUsuarios: usuariosRes.count ?? 0,
      totalPrestadores: prestadoresRes.count ?? 0,
      totalConsumidores: consumidoresRes.count ?? 0,
      totalContratacoes: contratacoesRes.count ?? 0,
      totalAnuncios: anunciosRes.count ?? 0
    };
  }
};
