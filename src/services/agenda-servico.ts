import { criarClienteSupabaseServidor } from "@/lib/banco/supabase-server";
import { ErroAplicacao } from "@/lib/utilitarios/erro-aplicacao";

export const agendaServico = {
  async listarAgendaPrestador(prestadorId: string, data?: string, somenteDisponiveis: boolean = false) {
    const supabase = criarClienteSupabaseServidor();

    let query = supabase
      .from(somenteDisponiveis ? "vw_agenda_disponivel" : "agenda")
      .select("*")
      .eq("prestador_id", prestadorId)
      .order("data", { ascending: true })
      .order("hora_inicio", { ascending: true });

    if (data) {
      query = query.eq("data", data);
    }

    const { data: slots, error } = await query;

    if (error) {
      throw new ErroAplicacao(error.message, 400);
    }

    return slots;
  },

  async criarHorario(prestadorId: string, data: string, horaInicio: string, horaFim: string) {
    const supabase = criarClienteSupabaseServidor();

    const { data: slot, error } = await supabase
      .from("agenda")
      .insert({
        prestador_id: prestadorId,
        data,
        hora_inicio: horaInicio,
        hora_fim: horaFim,
        disponivel: true
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        throw new ErroAplicacao("Este horário já está cadastrado para este prestador nesta data.", 400);
      }
      throw new ErroAplicacao(error.message, 400);
    }

    return slot;
  },

  async excluirHorario(id: string, prestadorId: string) {
    const supabase = criarClienteSupabaseServidor();

    const { error } = await supabase
      .from("agenda")
      .delete()
      .eq("id", id)
      .eq("prestador_id", prestadorId);

    if (error) {
      throw new ErroAplicacao(error.message, 400);
    }

    return true;
  },

  async obterHorariosDisponiveis(prestadorId: string, data: string) {
    const supabase = criarClienteSupabaseServidor();

    const { data: slots, error } = await supabase
      .from("agenda")
      .select("*")
      .eq("prestador_id", prestadorId)
      .eq("data", data)
      .eq("disponivel", true)
      .order("hora_inicio", { ascending: true });

    if (error) {
      throw new ErroAplicacao(error.message, 400);
    }

    return slots;
  }
};
