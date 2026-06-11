import { criarClienteSupabaseServidor } from "@/lib/banco/supabase-server";
import type { FotoDB } from "@/lib/utilitarios/mapeadores";

export const fotoRepositorio = {
  async listarFotosPorBarbearia(barbeariaId: string) {
    const supabase = criarClienteSupabaseServidor();
    const { data } = await supabase
      .from("fotos")
      .select("*")
      .eq("barbearia_id", barbeariaId)
      .order("criado_em", { ascending: false });
    return (data ?? []) as FotoDB[];
  },

  async criarFoto(dados: {
    barbearia_id: string;
    url: string;
    descricao?: string | null;
  }) {
    const supabase = criarClienteSupabaseServidor();
    const { data } = await supabase
      .from("fotos")
      .insert(dados)
      .select("*")
      .single();
    return data as FotoDB;
  },

  async removerFoto(id: string) {
    const supabase = criarClienteSupabaseServidor();
    const { data } = await supabase
      .from("fotos")
      .select("*")
      .eq("id", id)
      .single();

    if (data) {
      await supabase.from("fotos").delete().eq("id", id);
    }

    return data as FotoDB | null;
  }
};
