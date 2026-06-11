import { criarClienteSupabaseServidor } from "@/lib/banco/supabase-server";
import type { ServicoDB } from "@/lib/utilitarios/mapeadores";

export const servicoRepositorio = {
  async listarServicosPorBarbearia(barbeariaId: string) {
    const supabase = criarClienteSupabaseServidor();
    const { data } = await supabase
      .from("servicos")
      .select("*")
      .eq("barbearia_id", barbeariaId)
      .order("nome", { ascending: true });
    return (data ?? []) as ServicoDB[];
  },

  async obterServicoPorId(id: string) {
    const supabase = criarClienteSupabaseServidor();
    const { data } = await supabase
      .from("servicos")
      .select("*")
      .eq("id", id)
      .single();
    return data as ServicoDB | null;
  },

  async criarServico(dados: {
    nome: string;
    descricao: string;
    preco: number;
    duracao_minutos: number;
    ativo?: boolean;
    barbearia_id: string;
  }) {
    const supabase = criarClienteSupabaseServidor();
    const { data } = await supabase
      .from("servicos")
      .insert({ ativo: true, ...dados })
      .select("*")
      .single();
    return data as ServicoDB;
  },

  async atualizarServico(id: string, dados: {
    nome?: string;
    descricao?: string;
    preco?: number;
    duracao_minutos?: number;
    ativo?: boolean;
  }) {
    const supabase = criarClienteSupabaseServidor();
    const { data } = await supabase
      .from("servicos")
      .update(dados)
      .eq("id", id)
      .select("*")
      .single();
    return data as ServicoDB;
  }
};
