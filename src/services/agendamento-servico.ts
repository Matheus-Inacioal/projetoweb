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

    // 2. Busca informações do prestador para achar o loja_id
    const { data: prestador, error: prestadorError } = await supabase
      .from("prestadores")
      .select("loja_id")
      .eq("id", prestadorId)
      .single();

    if (prestadorError || !prestador) {
      throw new ErroAplicacao("Prestador não encontrado.", 404);
    }

    const { data: servico, error: servicoError } = await supabase
      .from("servicos")
      .select("*")
      .eq("id", servicoId)
      .eq("loja_id", prestador.loja_id)
      .single();

    if (servicoError || !servico) {
      throw new ErroAplicacao("Serviço não encontrado para a loja deste prestador.", 400);
    }

    // 3. Cria a contratação (status inicial 'pendente')
    const { data: contratacao, error: insertError } = await supabase
      .from("contratacoes")
      .insert({
        consumidor_id: consumidorId,
        prestador_id: prestadorId,
        agenda_id: agendaId,
        servico_id: servicoId,
        loja_id: prestador.loja_id,
        valor_total: servico.preco,
        status: "pendente",
        observacoes: observacao ?? null
      })
      .select()
      .single();

    if (insertError) {
      throw new ErroAplicacao("Erro ao registrar contratação: " + insertError.message, 400);
    }

    // 4. Marca o horário como indisponível
    await supabase
      .from("agenda")
      .update({ disponivel: false })
      .eq("id", agendaId);

    // 5. Grava log de criação no histórico
    await supabase.from("historico_contratacoes").insert({
      contratacao_id: contratacao.id,
      usuario_id: usuarioId,
      acao: "Criação da Contratação",
      status_anterior: null,
      status_novo: "pendente",
      observacao: observacao ?? "Agendamento criado pelo consumidor."
    });

    return contratacao;
  },

  async listarAgendamentosConsumidor(usuarioId: string) {
    const supabase = criarClienteSupabaseServidor();
    const consumidorId = await this.obterConsumidorId(usuarioId);

    const { data, error } = await supabase
      .from("contratacoes")
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
        ),
        agenda (
          data,
          hora_inicio,
          hora_fim
        )
      `)
      .eq("consumidor_id", consumidorId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new ErroAplicacao(error.message, 400);
    }

    // Resolve propostas de remarcação se existirem
    const agendaIdsParaBuscar: string[] = [];
    data.forEach((c: any) => {
      if (c.status === "remarcacao_solicitada" && c.observacoes) {
        try {
          const parsed = JSON.parse(c.observacoes);
          if (parsed && parsed.novaAgendaId) {
            agendaIdsParaBuscar.push(parsed.novaAgendaId);
            c._novaAgendaId = parsed.novaAgendaId;
            c._motivoRemarcacao = parsed.motivo;
          }
        } catch (_) {}
      }
    });

    let slotsMap: Record<string, any> = {};
    if (agendaIdsParaBuscar.length > 0) {
      const { data: slots } = await supabase
        .from("agenda")
        .select("id, data, hora_inicio, hora_fim")
        .in("id", agendaIdsParaBuscar);

      if (slots) {
        slots.forEach((s: any) => {
          slotsMap[s.id] = s;
        });
      }
    }

    return data.map((c: any) => {
      const novaAgenda = c._novaAgendaId ? slotsMap[c._novaAgendaId] : null;
      return {
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
        data: c.agenda?.data || "",
        horario: c.agenda?.hora_inicio ? `${c.agenda.hora_inicio.slice(0, 5)} - ${c.agenda.hora_fim?.slice(0, 5) || "--:--"}` : "",
        valor: Number(c.valor_total),
        status: c.status as StatusAgendamento,
        observacao: c.status === "remarcacao_solicitada" ? (c._motivoRemarcacao || c.observacoes) : c.observacoes,
        criadoEm: c.created_at,
        propostaRemarcacao: novaAgenda ? {
          agendaId: novaAgenda.id,
          data: novaAgenda.data,
          horario: novaAgenda.hora_inicio ? `${novaAgenda.hora_inicio.slice(0, 5)} - ${novaAgenda.hora_fim?.slice(0, 5) || "--:--"}` : "",
          motivo: c._motivoRemarcacao || ""
        } : null
      };
    });
  },

  async listarAgendamentosPrestador(prestadorId: string) {
    const supabase = criarClienteSupabaseServidor();

    const { data, error } = await supabase
      .from("contratacoes")
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
        ),
        agenda (
          data,
          hora_inicio,
          hora_fim
        )
      `)
      .eq("prestador_id", prestadorId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new ErroAplicacao(error.message, 400);
    }

    // Resolve propostas de remarcação se existirem
    const agendaIdsParaBuscar: string[] = [];
    data.forEach((c: any) => {
      if (c.status === "remarcacao_solicitada" && c.observacoes) {
        try {
          const parsed = JSON.parse(c.observacoes);
          if (parsed && parsed.novaAgendaId) {
            agendaIdsParaBuscar.push(parsed.novaAgendaId);
            c._novaAgendaId = parsed.novaAgendaId;
            c._motivoRemarcacao = parsed.motivo;
          }
        } catch (_) {}
      }
    });

    let slotsMap: Record<string, any> = {};
    if (agendaIdsParaBuscar.length > 0) {
      const { data: slots } = await supabase
        .from("agenda")
        .select("id, data, hora_inicio, hora_fim")
        .in("id", agendaIdsParaBuscar);

      if (slots) {
        slots.forEach((s: any) => {
          slotsMap[s.id] = s;
        });
      }
    }

    return data.map((c: any) => {
      const novaAgenda = c._novaAgendaId ? slotsMap[c._novaAgendaId] : null;
      return {
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
        data: c.agenda?.data || "",
        horario: c.agenda?.hora_inicio ? `${c.agenda.hora_inicio.slice(0, 5)} - ${c.agenda.hora_fim?.slice(0, 5) || "--:--"}` : "",
        valor: Number(c.valor_total),
        status: c.status as StatusAgendamento,
        observacao: c.status === "remarcacao_solicitada" ? (c._motivoRemarcacao || c.observacoes) : c.observacoes,
        criadoEm: c.created_at,
        propostaRemarcacao: novaAgenda ? {
          agendaId: novaAgenda.id,
          data: novaAgenda.data,
          horario: novaAgenda.hora_inicio ? `${novaAgenda.hora_inicio.slice(0, 5)} - ${novaAgenda.hora_fim?.slice(0, 5) || "--:--"}` : "",
          motivo: c._motivoRemarcacao || ""
        } : null
      };
    });
  },

  async atualizarStatus(contratacaoId: string, status: StatusAgendamento, usuarioId?: string, observacao?: string) {
    const supabase = criarClienteSupabaseServidor();

    // 1. Busca a contratação para ver qual era o agenda_id e o status anterior
    const { data: contratacao, error: fetchError } = await supabase
      .from("contratacoes")
      .select("agenda_id, status, consumidor_id, consumidores(usuario_id), prestador_id, prestadores(usuario_id)")
      .eq("id", contratacaoId)
      .single();

    if (fetchError || !contratacao) {
      throw new ErroAplicacao("Contratação não encontrada.", 404);
    }

    const statusAnterior = contratacao.status;

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

    // 3. Se foi recusado ou cancelado, libera o horário na agenda
    if ((status === "cancelado" || status === "recusado") && contratacao.agenda_id) {
      await supabase
        .from("agenda")
        .update({ disponivel: true })
        .eq("id", contratacao.agenda_id);
    } else if (status === "confirmado" && contratacao.agenda_id) {
      await supabase
        .from("agenda")
        .update({ disponivel: false })
        .eq("id", contratacao.agenda_id);
    }

    // 4. Determina quem executou a ação para salvar no log
    let executorId = usuarioId;
    if (!executorId) {
      executorId = status === "cancelado"
        ? (contratacao.consumidores as any)?.usuario_id
        : (contratacao.prestadores as any)?.usuario_id;
    }

    // 5. Grava log no histórico
    if (executorId) {
      await supabase.from("historico_contratacoes").insert({
        contratacao_id: contratacaoId,
        usuario_id: executorId,
        acao: `Alteração de Status para ${status}`,
        status_anterior: statusAnterior,
        status_novo: status,
        observacao: observacao ?? `Status atualizado para ${status}.`
      });
    }

    return data;
  },

  async aprovarContratacao(contratacaoId: string, usuarioId: string) {
    return this.atualizarStatus(contratacaoId, "confirmado", usuarioId, "Contratação confirmada pelo prestador.");
  },

  async recusarContratacao(contratacaoId: string, usuarioId: string, observacao: string) {
    return this.atualizarStatus(contratacaoId, "recusado", usuarioId, observacao || "Contratação recusada pelo prestador.");
  },

  async solicitarRemarcacao(
    contratacaoId: string,
    usuarioId: string,
    novaAgendaId: string,
    observacao: string
  ) {
    const supabase = criarClienteSupabaseServidor();

    // 1. Busca dados da nova agenda para verificar se está disponível
    const { data: slot, error: slotError } = await supabase
      .from("agenda")
      .select("*")
      .eq("id", novaAgendaId)
      .single();

    if (slotError || !slot || !slot.disponivel) {
      throw new ErroAplicacao("Horário sugerido indisponível ou não encontrado.", 400);
    }

    // 2. Busca a contratação e status anterior
    const { data: contratacao, error: fetchError } = await supabase
      .from("contratacoes")
      .select("status, agenda_id")
      .eq("id", contratacaoId)
      .single();

    if (fetchError || !contratacao) {
      throw new ErroAplicacao("Contratação não encontrada.", 404);
    }

    // 3. Atualiza o status e armazena a proposta no campo observacoes como JSON
    const novaObservacao = JSON.stringify({
      novaAgendaId,
      motivo: observacao
    });

    const { data, error } = await supabase
      .from("contratacoes")
      .update({
        status: "remarcacao_solicitada",
        observacoes: novaObservacao
      })
      .eq("id", contratacaoId)
      .select()
      .single();

    if (error) {
      throw new ErroAplicacao(error.message, 400);
    }

    // 4. Marca o novo slot sugerido temporariamente como indisponível (para não ser reservado por outro)
    await supabase
      .from("agenda")
      .update({ disponivel: false })
      .eq("id", novaAgendaId);

    // 5. Grava log no histórico
    await supabase.from("historico_contratacoes").insert({
      contratacao_id: contratacaoId,
      usuario_id: usuarioId,
      acao: "Solicitação de Remarcação",
      status_anterior: contratacao.status,
      status_novo: "remarcacao_solicitada",
      observacao: `Remarcação solicitada para o dia ${slot.data} às ${slot.hora_inicio.slice(0, 5)} - ${slot.hora_fim?.slice(0, 5) || "--:--"}. Motivo: ${observacao}`
    });

    return data;
  },

  async responderRemarcacao(contratacaoId: string, usuarioId: string, aceito: boolean) {
    const supabase = criarClienteSupabaseServidor();

    // 1. Busca a contratação
    const { data: contratacao, error: fetchError } = await supabase
      .from("contratacoes")
      .select("*")
      .eq("id", contratacaoId)
      .single();

    if (fetchError || !contratacao) {
      throw new ErroAplicacao("Contratação não encontrada.", 404);
    }

    if (contratacao.status !== "remarcacao_solicitada") {
      throw new ErroAplicacao("Esta contratação não possui solicitação de remarcação ativa.", 400);
    }

    // Parse do slot sugerido
    let proposta: { novaAgendaId: string; motivo: string } | null = null;
    try {
      proposta = JSON.parse(contratacao.observacoes || "");
    } catch (e) {
      throw new ErroAplicacao("Não foi possível processar a proposta de remarcação.", 400);
    }

    if (!proposta || !proposta.novaAgendaId) {
      throw new ErroAplicacao("Dados de remarcação inválidos ou incompletos.", 400);
    }

    const statusAnterior = contratacao.status;

    if (aceito) {
      // 1. Libera o slot ANTIGO (agenda_id anterior)
      if (contratacao.agenda_id) {
        await supabase
          .from("agenda")
          .update({ disponivel: true })
          .eq("id", contratacao.agenda_id);
      }

      // 2. Atualiza a contratação para o novo slot e altera status para 'remarcado'
      const { data, error } = await supabase
        .from("contratacoes")
        .update({
          status: "remarcado",
          agenda_id: proposta.novaAgendaId,
          observacoes: `Remarcado. Motivo original: ${proposta.motivo}`
        })
        .eq("id", contratacaoId)
        .select()
        .single();

      if (error) {
        throw new ErroAplicacao(error.message, 400);
      }

      // 3. Garante que o novo slot está marcado como ocupado
      await supabase
        .from("agenda")
        .update({ disponivel: false })
        .eq("id", proposta.novaAgendaId);

      // 4. Grava log no histórico
      await supabase.from("historico_contratacoes").insert({
        contratacao_id: contratacaoId,
        usuario_id: usuarioId,
        acao: "Remarcação Aceita",
        status_anterior: statusAnterior,
        status_novo: "remarcado",
        observacao: "O consumidor aceitou a proposta de remarcação."
      });

      return data;
    } else {
      // 1. Libera o slot NOVO sugerido
      await supabase
        .from("agenda")
        .update({ disponivel: true })
        .eq("id", proposta.novaAgendaId);

      // 2. Libera o slot ANTIGO
      if (contratacao.agenda_id) {
        await supabase
          .from("agenda")
          .update({ disponivel: true })
          .eq("id", contratacao.agenda_id);
      }

      // 3. Atualiza a contratação para status 'cancelado'
      const { data, error } = await supabase
        .from("contratacoes")
        .update({
          status: "cancelado",
          observacoes: `Remarcação recusada pelo consumidor. Motivo da remarcação: ${proposta.motivo}`
        })
        .eq("id", contratacaoId)
        .select()
        .single();

      if (error) {
        throw new ErroAplicacao(error.message, 400);
      }

      // 4. Grava log no histórico
      await supabase.from("historico_contratacoes").insert({
        contratacao_id: contratacaoId,
        usuario_id: usuarioId,
        acao: "Remarcação Recusada (Cancelado)",
        status_anterior: statusAnterior,
        status_novo: "cancelado",
        observacao: "O consumidor recusou a proposta de remarcação. Agendamento cancelado."
      });

      return data;
    }
  }
};

