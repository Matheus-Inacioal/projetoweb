import { criarClienteSupabaseServidor } from "@/lib/banco/supabase-server";
import { ErroAplicacao } from "@/lib/utilitarios/erro-aplicacao";

export const favoritoServico = {
  async adicionarFavorito(consumidorId: string, prestadorId: string) {
    const supabase = criarClienteSupabaseServidor();

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

  async removerFavorito(consumidorId: string, prestadorId: string) {
    const supabase = criarClienteSupabaseServidor();

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

  async listarFavoritos(consumidorId: string) {
    const supabase = criarClienteSupabaseServidor();

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
          usuarios (
            nome,
            foto_url
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
      prestadorFotoUrl: f.prestadores?.usuarios?.foto_url ?? null,
      criadoEm: f.criado_em
    }));
  },

  async eFavorito(consumidorId: string, prestadorId: string): Promise<boolean> {
    const supabase = criarClienteSupabaseServidor();

    const { data, error } = await supabase
      .from("favoritos")
      .select("id")
      .eq("consumidor_id", consumidorId)
      .eq("prestador_id", prestadorId)
      .maybeSingle();

    if (error) return false;
    return !!data;
  }
};
