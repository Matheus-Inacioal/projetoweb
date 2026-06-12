import { criarClienteSupabaseServidor } from "@/lib/banco/supabase-server";
import { ErroAplicacao } from "@/lib/utilitarios/erro-aplicacao";

export const favoritoServico = {
  async obterConsumidorId(usuarioId: string) {
    const supabase = criarClienteSupabaseServidor();
    const { data, error } = await supabase
      .from("consumidores")
      .select("id")
      .eq("usuario_id", usuarioId)
      .single();

    if (error || !data) {
      throw new ErroAplicacao("Perfil de consumidor não encontrado.", 404);
    }

    return data.id;
  },

  async adicionarFavorito(usuarioId: string, prestadorId: string) {
    const supabase = criarClienteSupabaseServidor();
    const consumidorId = await this.obterConsumidorId(usuarioId);

    const { data, error } = await supabase
      .from("favoritos")
      .insert({
        consumidor_id: consumidorId,
        prestador_id: prestadorId
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return { mensagem: "Já está nos favoritos." };
      }
      throw new ErroAplicacao(error.message, 400);
    }

    return data;
  },

  async removerFavorito(usuarioId: string, prestadorId: string) {
    const supabase = criarClienteSupabaseServidor();
    const consumidorId = await this.obterConsumidorId(usuarioId);

    const { error } = await supabase
      .from("favoritos")
      .delete()
      .eq("consumidor_id", consumidorId)
      .eq("prestador_id", prestadorId);

    if (error) {
      throw new ErroAplicacao(error.message, 400);
    }

    return true;
  },

  async listarFavoritos(usuarioId: string) {
    const supabase = criarClienteSupabaseServidor();
    const consumidorId = await this.obterConsumidorId(usuarioId);

    const { data, error } = await supabase
      .from("favoritos")
      .select(`
        id,
        consumidor_id,
        prestador_id,
        criado_em,
        prestadores (
          id,
          especialidade,
          foto_url,
          usuarios (
            nome
          )
        )
      `)
      .eq("consumidor_id", consumidorId);

    if (error) {
      throw new ErroAplicacao(error.message, 400);
    }

    return data.map((f: any) => ({
      id: f.id,
      consumidorId: f.consumidor_id,
      prestadorId: f.prestador_id,
      prestadorNome: f.prestadores?.usuarios?.nome ?? "Prestador",
      prestadorEspecialidade: f.prestadores?.especialidade ?? "",
      prestadorFotoUrl: f.prestadores?.foto_url ?? null,
      criadoEm: f.criado_em
    }));
  },

  async eFavorito(usuarioId: string, prestadorId: string): Promise<boolean> {
    const supabase = criarClienteSupabaseServidor();
    try {
      const consumidorId = await this.obterConsumidorId(usuarioId);

      const { data, error } = await supabase
        .from("favoritos")
        .select("id")
        .eq("consumidor_id", consumidorId)
        .eq("prestador_id", prestadorId)
        .maybeSingle();

      if (error) return false;
      return !!data;
    } catch {
      return false;
    }
  }
};
