import { criarClienteSupabaseServidor } from "@/lib/banco/supabase-server";
import type { AvaliacaoDB } from "@/lib/utilitarios/mapeadores";

export const avaliacaoRepositorio = {
  async obterAvaliacaoPorAgendamentoId(agendamentoId: string) {
    const supabase = criarClienteSupabaseServidor();
    const { data } = await supabase
      .from("avaliacoes")
      .select("*")
      .eq("agendamento_id", agendamentoId)
      .single();
    return data as AvaliacaoDB | null;
  },

  async criarAvaliacao(dados: {
    agendamento_id: string;
    nota: number;
    comentario?: string | null;
  }) {
    const supabase = criarClienteSupabaseServidor();
    const { data } = await supabase
      .from("avaliacoes")
      .insert(dados)
      .select("*")
      .single();
    return data as AvaliacaoDB;
  }
};
