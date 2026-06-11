import { criarClienteSupabaseServidor } from "@/lib/banco/supabase-server";
import type { BarbeariaComRelacoesDB } from "@/lib/utilitarios/mapeadores";

const SELECAO_BARBEARIA_COM_RELACOES = "*, responsavel:profiles!responsavel_id(*), barbeiros(*), servicos(*)";

export const barbeariaRepositorio = {
  async listarBarbearias() {
    const supabase = criarClienteSupabaseServidor();
    const { data } = await supabase
      .from("barbearias")
      .select(SELECAO_BARBEARIA_COM_RELACOES)
      .order("nome", { ascending: true });
    return (data ?? []) as BarbeariaComRelacoesDB[];
  },

  async obterBarbeariaPorId(id: string) {
    const supabase = criarClienteSupabaseServidor();
    const { data } = await supabase
      .from("barbearias")
      .select(SELECAO_BARBEARIA_COM_RELACOES)
      .eq("id", id)
      .single();
    return data as BarbeariaComRelacoesDB | null;
  },

  async obterBarbeariaPorResponsavelId(responsavelId: string) {
    const supabase = criarClienteSupabaseServidor();
    const { data } = await supabase
      .from("barbearias")
      .select(SELECAO_BARBEARIA_COM_RELACOES)
      .eq("responsavel_id", responsavelId)
      .limit(1)
      .single();
    return data as BarbeariaComRelacoesDB | null;
  },

  async criarBarbearia(dados: {
    nome: string;
    descricao: string;
    endereco: string;
    telefone: string;
    responsavel_id: string;
    bairro?: string;
    cidade?: string;
  }) {
    const supabase = criarClienteSupabaseServidor();
    const { data } = await supabase
      .from("barbearias")
      .insert(dados)
      .select(SELECAO_BARBEARIA_COM_RELACOES)
      .single();
    return data as BarbeariaComRelacoesDB;
  },

  async atualizarBarbearia(id: string, dados: {
    nome?: string;
    descricao?: string;
    endereco?: string;
    telefone?: string;
    bairro?: string;
    cidade?: string;
    imagem?: string;
    avaliacao_media?: number;
    destaque?: boolean;
  }) {
    const supabase = criarClienteSupabaseServidor();
    const { data } = await supabase
      .from("barbearias")
      .update(dados)
      .eq("id", id)
      .select(SELECAO_BARBEARIA_COM_RELACOES)
      .single();
    return data as BarbeariaComRelacoesDB;
  },

  async contarBarbearias() {
    const supabase = criarClienteSupabaseServidor();
    const { count } = await supabase
      .from("barbearias")
      .select("*", { count: "exact", head: true });
    return count ?? 0;
  }
};
