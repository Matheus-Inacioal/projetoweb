import { criarClienteSupabaseServidor } from "@/lib/banco/supabase-server";
import type { AgendamentoComRelacoesDB } from "@/lib/utilitarios/mapeadores";
import type { StatusAgendamento } from "@/tipos/enums";

const SELECAO_AGENDAMENTO_COM_RELACOES =
  "*, contratante:profiles!contratante_id(*), barbearia:barbearias(*), barbeiro:barbeiros(*), servico:servicos(*), avaliacoes(*)";

export const agendamentoRepositorio = {
  async criarAgendamento(dados: {
    contratante_id: string;
    barbearia_id: string;
    barbeiro_id: string;
    servico_id: string;
    data: string;
    hora: string;
    status?: string;
    observacao?: string | null;
  }) {
    const supabase = criarClienteSupabaseServidor();
    const { data } = await supabase
      .from("agendamentos")
      .insert({ status: "PENDENTE", ...dados })
      .select(SELECAO_AGENDAMENTO_COM_RELACOES)
      .single();
    return data as AgendamentoComRelacoesDB;
  },

  async obterAgendamentoPorId(id: string) {
    const supabase = criarClienteSupabaseServidor();
    const { data } = await supabase
      .from("agendamentos")
      .select(SELECAO_AGENDAMENTO_COM_RELACOES)
      .eq("id", id)
      .single();
    return data as AgendamentoComRelacoesDB | null;
  },

  async listarAgendamentosPorContratante(contratanteId: string) {
    const supabase = criarClienteSupabaseServidor();
    const { data } = await supabase
      .from("agendamentos")
      .select(SELECAO_AGENDAMENTO_COM_RELACOES)
      .eq("contratante_id", contratanteId)
      .order("data", { ascending: true })
      .order("hora", { ascending: true });
    return (data ?? []) as AgendamentoComRelacoesDB[];
  },

  async listarAgendamentosPorBarbeiro(barbeiroId: string) {
    const supabase = criarClienteSupabaseServidor();
    const { data } = await supabase
      .from("agendamentos")
      .select(SELECAO_AGENDAMENTO_COM_RELACOES)
      .eq("barbeiro_id", barbeiroId)
      .order("data", { ascending: true })
      .order("hora", { ascending: true });
    return (data ?? []) as AgendamentoComRelacoesDB[];
  },

  async listarAgendamentosPorBarbearia(barbeariaId: string) {
    const supabase = criarClienteSupabaseServidor();
    const { data } = await supabase
      .from("agendamentos")
      .select(SELECAO_AGENDAMENTO_COM_RELACOES)
      .eq("barbearia_id", barbeariaId)
      .order("data", { ascending: true })
      .order("hora", { ascending: true });
    return (data ?? []) as AgendamentoComRelacoesDB[];
  },

  async listarAgendamentosDoDiaPorBarbeiro(barbeiroId: string, data: Date) {
    const dataStr = data.toISOString().split("T")[0];

    const supabase = criarClienteSupabaseServidor();
    const { data: resultado } = await supabase
      .from("agendamentos")
      .select(SELECAO_AGENDAMENTO_COM_RELACOES)
      .eq("barbeiro_id", barbeiroId)
      .eq("data", dataStr)
      .order("hora", { ascending: true });
    return (resultado ?? []) as AgendamentoComRelacoesDB[];
  },

  async listarAgendamentosDoDiaPorBarbearia(barbeariaId: string, data: Date) {
    const dataStr = data.toISOString().split("T")[0];

    const supabase = criarClienteSupabaseServidor();
    const { data: resultado } = await supabase
      .from("agendamentos")
      .select(SELECAO_AGENDAMENTO_COM_RELACOES)
      .eq("barbearia_id", barbeariaId)
      .eq("data", dataStr)
      .order("hora", { ascending: true });
    return (resultado ?? []) as AgendamentoComRelacoesDB[];
  },

  async listarAgendamentosAtivosDoDiaPorBarbeiro(barbeiroId: string, data: Date) {
    const dataStr = data.toISOString().split("T")[0];

    const supabase = criarClienteSupabaseServidor();
    const { data: resultado } = await supabase
      .from("agendamentos")
      .select(SELECAO_AGENDAMENTO_COM_RELACOES)
      .eq("barbeiro_id", barbeiroId)
      .eq("data", dataStr)
      .neq("status", "CANCELADO")
      .order("hora", { ascending: true });
    return (resultado ?? []) as AgendamentoComRelacoesDB[];
  },

  async atualizarStatusAgendamento(id: string, status: StatusAgendamento) {
    const supabase = criarClienteSupabaseServidor();
    const { data } = await supabase
      .from("agendamentos")
      .update({ status })
      .eq("id", id)
      .select(SELECAO_AGENDAMENTO_COM_RELACOES)
      .single();
    return data as AgendamentoComRelacoesDB;
  },

  async listarTodosAgendamentos() {
    const supabase = criarClienteSupabaseServidor();
    const { data } = await supabase
      .from("agendamentos")
      .select(SELECAO_AGENDAMENTO_COM_RELACOES)
      .order("data", { ascending: false })
      .order("hora", { ascending: false });
    return (data ?? []) as AgendamentoComRelacoesDB[];
  },

  async contarAgendamentos() {
    const supabase = criarClienteSupabaseServidor();
    const { count } = await supabase
      .from("agendamentos")
      .select("*", { count: "exact", head: true });
    return count ?? 0;
  },

  async contarAgendamentosPorStatus(status: StatusAgendamento) {
    const supabase = criarClienteSupabaseServidor();
    const { count } = await supabase
      .from("agendamentos")
      .select("*", { count: "exact", head: true })
      .eq("status", status);
    return count ?? 0;
  }
};
