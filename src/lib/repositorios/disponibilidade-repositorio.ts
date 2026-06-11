import { criarClienteSupabaseServidor } from "@/lib/banco/supabase-server";
import type { DisponibilidadeDB } from "@/lib/utilitarios/mapeadores";
import type { DiaSemana } from "@/tipos/enums";

export const disponibilidadeRepositorio = {
  async listarDisponibilidadesPorBarbeiro(barbeiroId: string) {
    const supabase = criarClienteSupabaseServidor();
    const { data } = await supabase
      .from("disponibilidades")
      .select("*")
      .eq("barbeiro_id", barbeiroId)
      .order("dia_semana", { ascending: true })
      .order("hora_inicio", { ascending: true });
    return (data ?? []) as DisponibilidadeDB[];
  },

  async criarDisponibilidade(dados: {
    barbeiro_id: string;
    dia_semana: string;
    hora_inicio: string;
    hora_fim: string;
  }) {
    const supabase = criarClienteSupabaseServidor();
    const { data } = await supabase
      .from("disponibilidades")
      .insert(dados)
      .select("*")
      .single();
    return data as DisponibilidadeDB;
  },

  async listarDisponibilidadesPorBarbeiroEDia(barbeiroId: string, diaSemana: DiaSemana) {
    const supabase = criarClienteSupabaseServidor();
    const { data } = await supabase
      .from("disponibilidades")
      .select("*")
      .eq("barbeiro_id", barbeiroId)
      .eq("dia_semana", diaSemana)
      .order("hora_inicio", { ascending: true });
    return (data ?? []) as DisponibilidadeDB[];
  }
};
