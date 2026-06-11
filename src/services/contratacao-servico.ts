import { criarClienteSupabaseServidor } from "@/lib/banco/supabase-server";
import { ErroAplicacao } from "@/lib/utilitarios/erro-aplicacao";
import type { StatusContratacao } from "@/tipos/enums";

export const contratacaoServico = {
  async contratarServico(
    consumidorId: string,
    prestadorId: string,
    agendaId: string,
    servicoId: string,
    observacao?: string
  ) {
    const supabase = criarClienteSupabaseServidor();

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
      throw new ErroAplicacao("Este horário já foi contratado por outra pessoa.", 400);
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

    // 3. Cria a contratação
    const { data: contratacao, error: insertError } = await supabase
      .from("contratacoes")
      .insert({
        consumidor_id: consumidorId,
        prestador_id: prestadorId,
        agenda_id: agendaId,
        servico_id: servicoId,
        data: slot.data,
        horario: slot.hora_inicio,
        valor: servico.preco,
        status: "PENDENTE",
        observacao: observacao ?? null
      })
      .select()
      .single();

    if (insertError) {
      throw new ErroAplicacao("Erro ao registrar a contratação: " + insertError.message, 400);
    }

    // 4. Marca o horário como indisponível
    await supabase
      .from("agenda")
      .update({ disponivel: false })
      .eq("id", agendaId);

    return contratacao;
  },

  async listarContratacoesConsumidor(consumidorId: string) {
    const supabase = criarClienteSupabaseServidor();

    const { data, error } = await supabase
      .from("contratacoes")
      .select(`
        *,
        prestadores (
          id,
          especialidade,
          usuarios (
            nome
          )
        ),
        servicos (
          nome
        )
      `)
      .eq("consumidor_id", consumidorId)
      .order("data", { ascending: false })
      .order("horario", { ascending: false });

    if (error) {
      throw new ErroAplicacao(error.message, 400);
    }

    return data.map((c: any) => ({
      id: c.id,
      consumidorId: c.consumidor_id,
      consumidorNome: "", // Preenchido no controller/view se necessário
      consumidorEmail: "",
      prestadorId: c.prestador_id,
      prestadorNome: c.prestadores?.usuarios?.nome ?? "Prestador",
      prestadorEspecialidade: c.prestadores?.especialidade ?? "",
      agendaId: c.agenda_id,
      servicoId: c.servico_id,
      servicoNome: c.servicos?.nome ?? "Serviço Removido",
      data: c.data,
      horario: c.horario,
      valor: c.valor,
      status: c.status as StatusContratacao,
      observacao: c.observacao,
      criadoEm: c.criado_em
    }));
  },

  async listarContratacoesPrestador(prestadorId: string) {
    const supabase = criarClienteSupabaseServidor();

    const { data, error } = await supabase
      .from("contratacoes")
      .select(`
        *,
        usuarios (
          nome,
          email
        ),
        servicos (
          nome
        )
      `)
      .eq("prestador_id", prestadorId)
      .order("data", { ascending: false })
      .order("horario", { ascending: false });

    if (error) {
      throw new ErroAplicacao(error.message, 400);
    }

    return data.map((c: any) => ({
      id: c.id,
      consumidorId: c.consumidor_id,
      consumidorNome: c.usuarios?.nome ?? "Cliente",
      consumidorEmail: c.usuarios?.email ?? "",
      prestadorId: c.prestador_id,
      prestadorNome: "",
      prestadorEspecialidade: "",
      agendaId: c.agenda_id,
      servicoId: c.servico_id,
      servicoNome: c.servicos?.nome ?? "Serviço Removido",
      data: c.data,
      horario: c.horario,
      valor: c.valor,
      status: c.status as StatusContratacao,
      observacao: c.observacao,
      criadoEm: c.criado_em
    }));
  },

  async atualizarStatus(contratacaoId: string, status: StatusContratacao) {
    const supabase = criarClienteSupabaseServidor();

    // 1. Busca a contratação para ver qual era o agendaId
    const { data: contratacao, error: fetchError } = await supabase
      .from("contratacoes")
      .select("agenda_id, status")
      .eq("id", contratacaoId)
      .single();

    if (fetchError || !contratacao) {
      throw new ErroAplicacao("Contratação não encontrada.", 404);
    }

    // 2. Atualiza o status
    const { data, error } = await supabase
      .from("contratacoes")
      .update({ status })
      .eq("id", contratacaoId)
      .select()
      .single();

    if (error) {
      throw new ErroAplicacao(error.message, 400);
    }

    // 3. Se foi cancelado, libera o horário na agenda
    if (status === "CANCELADO" && contratacao.agenda_id) {
      await supabase
        .from("agenda")
        .update({ disponivel: true })
        .eq("id", contratacao.agenda_id);
    }

    return data;
  }
};
