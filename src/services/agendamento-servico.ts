import { criarClienteSupabaseServidor } from "@/lib/banco/supabase-server";
import { ErroAplicacao } from "@/lib/utilitarios/erro-aplicacao";
import type { StatusAgendamento } from "@/tipos/enums";

export const agendamentoServico = {
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

  async agendarServico(
    usuarioId: string,
    prestadorId: string,
    agendaId: string,
    servicoId: string,
    observacao?: string
  ) {
    const supabase = criarClienteSupabaseServidor();
    const consumidorId = await this.obterConsumidorId(usuarioId);

    // 1. Verifica se o horário está disponível
    const { data: slot, error: slotError } = await supabase
      .from("agenda")
      .select("*")
      .eq("id", agendaId)
      .eq("prestador_id", prestadorId)
      .single();

    if (slotError || !slot) {
      throw new ErroAplicacao("Horário indisponível ou não cadastrado.", 400);
    }

    if (!slot.disponivel) {
      throw new ErroAplicacao("Este horário já foi agendado por outra pessoa.", 400);
    }

    // 2. Busca informações do serviço
    const { data: servico, error: servicoError } = await supabase
      .from("servicos")
      .select("*")
      .eq("id", servicoId)
      .eq("prestador_id", prestadorId)
      .single();

    if (servicoError || !servico) {
      throw new ErroAplicacao("Serviço não encontrado para este prestador.", 400);
    }

    // 3. Cria o agendamento (status inicial 'pendente')
    const { data: agendamento, error: insertError } = await supabase
      .from("agendamentos")
      .insert({
        consumidor_id: consumidorId,
        prestador_id: prestadorId,
        agenda_id: agendaId,
        servico_id: servicoId,
        valor: servico.preco,
        status: "pendente",
        observacao: observacao ?? null
      })
      .select()
      .single();

    if (insertError) {
      throw new ErroAplicacao("Erro ao registrar agendamento: " + insertError.message, 400);
    }

    // 4. Marca o horário como indisponível
    await supabase
      .from("agenda")
      .update({ disponivel: false })
      .eq("id", agendaId);

    return agendamento;
  },

  async listarAgendamentosConsumidor(usuarioId: string) {
    const supabase = criarClienteSupabaseServidor();
    const consumidorId = await this.obterConsumidorId(usuarioId);

    const { data, error } = await supabase
      .from("agendamentos")
      .select(`
        *,
        prestadores (
          id,
          especialidade,
          foto_url,
          usuarios (
            nome
          )
        ),
        servicos (
          nome
        )
      `)
      .eq("consumidor_id", consumidorId)
      .order("criado_em", { ascending: false });

    if (error) {
      throw new ErroAplicacao(error.message, 400);
    }

    return data.map((c: any) => ({
      id: c.id,
      consumidorId: c.consumidor_id,
      consumidorNome: "",
      consumidorEmail: "",
      prestadorId: c.prestador_id,
      prestadorNome: c.prestadores?.usuarios?.nome ?? "Prestador",
      prestadorEspecialidade: c.prestadores?.especialidade ?? "",
      prestadorFotoUrl: c.prestadores?.foto_url ?? null,
      agendaId: c.agenda_id,
      servicoId: c.servico_id,
      servicoNome: c.servicos?.nome ?? "Serviço Removido",
      data: c.data || "", // query from agenda or use the database fields
      horario: c.horario || "",
      valor: Number(c.valor),
      status: c.status as StatusAgendamento,
      observacao: c.observacao,
      criadoEm: c.criado_em
    }));
  },

  async listarAgendamentosPrestador(prestadorId: string) {
    const supabase = criarClienteSupabaseServidor();

    const { data, error } = await supabase
      .from("agendamentos")
      .select(`
        *,
        consumidores (
          id,
          usuarios (
            nome,
            email
          )
        ),
        servicos (
          nome
        )
      `)
      .eq("prestador_id", prestadorId)
      .order("criado_em", { ascending: false });

    if (error) {
      throw new ErroAplicacao(error.message, 400);
    }

    return data.map((c: any) => ({
      id: c.id,
      consumidorId: c.consumidor_id,
      consumidorNome: c.consumidores?.usuarios?.nome ?? "Cliente",
      consumidorEmail: c.consumidores?.usuarios?.email ?? "",
      prestadorId: c.prestador_id,
      prestadorNome: "",
      prestadorEspecialidade: "",
      agendaId: c.agenda_id,
      servicoId: c.servico_id,
      servicoNome: c.servicos?.nome ?? "Serviço Removido",
      data: c.data || "",
      horario: c.horario || "",
      valor: Number(c.valor),
      status: c.status as StatusAgendamento,
      observacao: c.observacao,
      criadoEm: c.criado_em
    }));
  },

  async atualizarStatus(agendamentoId: string, status: StatusAgendamento) {
    const supabase = criarClienteSupabaseServidor();

    // 1. Busca a contratação para ver qual era o agenda_id
    const { data: agendamento, error: fetchError } = await supabase
      .from("agendamentos")
      .select("agenda_id, status")
      .eq("id", agendamentoId)
      .single();

    if (fetchError || !agendamento) {
      throw new ErroAplicacao("Agendamento não encontrado.", 404);
    }

    // 2. Atualiza o status
    const { data, error } = await supabase
      .from("agendamentos")
      .update({ status })
      .eq("id", agendamentoId)
      .select()
      .single();

    if (error) {
      throw new ErroAplicacao(error.message, 400);
    }

    // 3. Se foi cancelado, libera o horário na agenda
    if (status === "cancelado" && agendamento.agenda_id) {
      await supabase
        .from("agenda")
        .update({ disponivel: true })
        .eq("id", agendamento.agenda_id);
    }

    return data;
  }
};
