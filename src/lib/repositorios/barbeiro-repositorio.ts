import { criarClienteSupabaseServidor } from "@/lib/banco/supabase-server";
import type { BarbeiroComRelacoesDB } from "@/lib/utilitarios/mapeadores";

const SELECAO_BARBEIRO_COM_BARBEARIA = "*, barbearia:barbearias(*)";
const SELECAO_BARBEIRO_COMPLETO = "*, barbearia:barbearias(*), disponibilidades(*)";

export const barbeiroRepositorio = {
  async listarBarbeirosPorBarbearia(barbeariaId: string) {
    const supabase = criarClienteSupabaseServidor();
    const { data } = await supabase
      .from("barbeiros")
      .select(SELECAO_BARBEIRO_COM_BARBEARIA)
      .eq("barbearia_id", barbeariaId)
      .order("nome", { ascending: true });
    return (data ?? []) as BarbeiroComRelacoesDB[];
  },

  async obterBarbeiroPorId(id: string) {
    const supabase = criarClienteSupabaseServidor();
    const { data } = await supabase
      .from("barbeiros")
      .select(SELECAO_BARBEIRO_COMPLETO)
      .eq("id", id)
      .single();
    return data as BarbeiroComRelacoesDB | null;
  },

  async obterBarbeiroPorUsuarioId(usuarioId: string) {
    const supabase = criarClienteSupabaseServidor();
    const { data } = await supabase
      .from("barbeiros")
      .select(SELECAO_BARBEIRO_COMPLETO)
      .eq("usuario_id", usuarioId)
      .single();
    return data as BarbeiroComRelacoesDB | null;
  },

  async criarBarbeiro(dados: {
    nome: string;
    especialidade: string;
    descricao: string;
    telefone: string;
    ativo?: boolean;
    usuario_id?: string | null;
    barbearia_id?: string | null;
  }) {
    const supabase = criarClienteSupabaseServidor();
    const { data } = await supabase
      .from("barbeiros")
      .insert({ ativo: true, ...dados })
      .select(SELECAO_BARBEIRO_COMPLETO)
      .single();
    return data as BarbeiroComRelacoesDB;
  },

  async atualizarBarbeiro(id: string, dados: {
    nome?: string;
    especialidade?: string;
    descricao?: string;
    telefone?: string;
    ativo?: boolean;
  }) {
    const supabase = criarClienteSupabaseServidor();
    const { data } = await supabase
      .from("barbeiros")
      .update(dados)
      .eq("id", id)
      .select(SELECAO_BARBEIRO_COMPLETO)
      .single();
    return data as BarbeiroComRelacoesDB;
  }
};
