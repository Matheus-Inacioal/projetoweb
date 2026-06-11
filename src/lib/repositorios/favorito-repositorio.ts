import { criarClienteSupabaseServidor } from "@/lib/banco/supabase-server";
import type { FavoritoDB } from "@/lib/utilitarios/mapeadores";

export const favoritoRepositorio = {
  async listarFavoritosPorUsuario(usuarioId: string) {
    const supabase = criarClienteSupabaseServidor();
    const { data } = await supabase
      .from("favoritos")
      .select("*, barbearia:barbearias(*)")
      .eq("usuario_id", usuarioId)
      .order("criado_em", { ascending: false });
    return (data ?? []) as FavoritoDB[];
  },

  async obterFavorito(usuarioId: string, barbeariaId: string) {
    const supabase = criarClienteSupabaseServidor();
    const { data } = await supabase
      .from("favoritos")
      .select("*, barbearia:barbearias(*)")
      .eq("usuario_id", usuarioId)
      .eq("barbearia_id", barbeariaId)
      .single();
    return data as FavoritoDB | null;
  },

  async adicionarFavorito(dados: { usuario_id: string; barbearia_id: string }) {
    const supabase = criarClienteSupabaseServidor();
    const { data } = await supabase
      .from("favoritos")
      .insert(dados)
      .select("*, barbearia:barbearias(*)")
      .single();
    return data as FavoritoDB;
  },

  async removerFavorito(id: string) {
    const supabase = criarClienteSupabaseServidor();
    await supabase.from("favoritos").delete().eq("id", id);
  },

  async removerFavoritoPorUsuarioEBarbearia(usuarioId: string, barbeariaId: string) {
    const supabase = criarClienteSupabaseServidor();
    await supabase
      .from("favoritos")
      .delete()
      .eq("usuario_id", usuarioId)
      .eq("barbearia_id", barbeariaId);
  }
};
