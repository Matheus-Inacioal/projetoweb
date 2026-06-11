import { agendamentoRepositorio } from "@/lib/repositorios/agendamento-repositorio";
import { barbeariaRepositorio } from "@/lib/repositorios/barbearia-repositorio";
import { barbeiroRepositorio } from "@/lib/repositorios/barbeiro-repositorio";
import { disponibilidadeRepositorio } from "@/lib/repositorios/disponibilidade-repositorio";
import { servicoRepositorio } from "@/lib/repositorios/servico-repositorio";
import { barbeariaServico } from "@/lib/servicos/barbearia-servico";
import { barbeiroServico } from "@/lib/servicos/barbeiro-servico";
import {
  adicionarDias,
  combinarDataHora,
  normalizarData,
  obterDiaSemanaPorData
} from "@/lib/utilitarios/datas";
import { garantirCondicao, garantirExistencia } from "@/lib/utilitarios/erro-aplicacao";
import {
  GAP_PADRAO_MINUTOS,
  gerarHorariosDisponiveis,
  possuiConflitoDeHorario
} from "@/lib/utilitarios/horarios-disponiveis";
import { mapearAgendamentoDetalhado } from "@/lib/utilitarios/mapeadores";
import type { AgendamentoComRelacoesDB } from "@/lib/utilitarios/mapeadores";
import { esquemaCriacaoAgendamento } from "@/lib/validacoes/agendamento-validacoes";
import { esquemaConsultaHorariosDisponiveis } from "@/lib/validacoes/horarios-disponiveis-validacoes";
import type { HorariosDisponiveisResumo, ProximaDisponibilidadeResumo } from "@/tipos/dados";
import type { PerfilUsuario } from "@/tipos/enums";

function mapearAgendamentosExistentes(agendamentosAtivos: AgendamentoComRelacoesDB[]) {
  return agendamentosAtivos.map((agendamentoAtual) => ({
    hora: agendamentoAtual.hora,
    duracaoMinutos: agendamentoAtual.servico.duracao_minutos
  }));
}

async function buscarProximaDisponibilidade(params: {
  barbeiroId: string;
  duracaoServicoMinutos: number;
  disponibilidades: Awaited<ReturnType<typeof disponibilidadeRepositorio.listarDisponibilidadesPorBarbeiro>>;
  dataInicial: Date;
}) {
  for (let deslocamentoDias = 1; deslocamentoDias <= 30; deslocamentoDias += 1) {
    const dataAtual = adicionarDias(params.dataInicial, deslocamentoDias);
    const diaSemanaAtual = obterDiaSemanaPorData(dataAtual);
    const intervalosDoDia = params.disponibilidades
      .filter((disponibilidade) => disponibilidade.dia_semana === diaSemanaAtual)
      .map((disponibilidade) => ({
        horaInicio: disponibilidade.hora_inicio,
        horaFim: disponibilidade.hora_fim
      }));

    if (!intervalosDoDia.length) {
      continue;
    }

    const agendamentosAtivos = await agendamentoRepositorio.listarAgendamentosAtivosDoDiaPorBarbeiro(
      params.barbeiroId,
      dataAtual
    );

    const horariosDisponiveis = gerarHorariosDisponiveis({
      intervalosDisponiveis: intervalosDoDia,
      duracaoServico: params.duracaoServicoMinutos,
      gapMinutos: GAP_PADRAO_MINUTOS,
      agendamentosExistentes: mapearAgendamentosExistentes(agendamentosAtivos),
      dataReferencia: dataAtual
    });

    if (horariosDisponiveis.length) {
      const proximaDisponibilidade: ProximaDisponibilidadeResumo = {
        data: dataAtual.toISOString(),
        hora: horariosDisponiveis[0]
      };

      return proximaDisponibilidade;
    }
  }

  return null;
}

export const agendamentoServico = {
  async obterHorariosDisponiveis(entrada: { barbeiroId: string; data: string; servicoId: string }) {
    const dadosValidados = esquemaConsultaHorariosDisponiveis.parse({
      data: entrada.data,
      servicoId: entrada.servicoId
    });
    const dataSelecionada = normalizarData(dadosValidados.data);

    const [barbeiro, servico] = await Promise.all([
      barbeiroRepositorio.obterBarbeiroPorId(entrada.barbeiroId),
      servicoRepositorio.obterServicoPorId(dadosValidados.servicoId)
    ]);

    const barbeiroEncontrado = garantirExistencia(barbeiro, "Barbeiro nao encontrado.", 404);
    const servicoEncontrado = garantirExistencia(servico, "Servico nao encontrado.", 404);

    garantirCondicao(barbeiroEncontrado.ativo, "O barbeiro selecionado nao esta ativo.");
    garantirCondicao(servicoEncontrado.ativo, "O servico selecionado nao esta disponivel.");
    garantirCondicao(
      !!barbeiroEncontrado.barbearia_id && barbeiroEncontrado.barbearia_id === servicoEncontrado.barbearia_id,
      "O barbeiro selecionado nao atende este servico."
    );

    const disponibilidades = await disponibilidadeRepositorio.listarDisponibilidadesPorBarbeiro(barbeiroEncontrado.id);
    const diaSemanaSelecionado = obterDiaSemanaPorData(dataSelecionada);
    const intervalosDoDia = disponibilidades
      .filter((disponibilidade) => disponibilidade.dia_semana === diaSemanaSelecionado)
      .map((disponibilidade) => ({
        horaInicio: disponibilidade.hora_inicio,
        horaFim: disponibilidade.hora_fim
      }));

    const agendamentosAtivos = await agendamentoRepositorio.listarAgendamentosAtivosDoDiaPorBarbeiro(
      barbeiroEncontrado.id,
      dataSelecionada
    );

    const horariosDisponiveis = gerarHorariosDisponiveis({
      intervalosDisponiveis: intervalosDoDia,
      duracaoServico: servicoEncontrado.duracao_minutos,
      gapMinutos: GAP_PADRAO_MINUTOS,
      agendamentosExistentes: mapearAgendamentosExistentes(agendamentosAtivos),
      dataReferencia: dataSelecionada
    });

    const proximaDisponibilidade =
      horariosDisponiveis.length === 0
        ? await buscarProximaDisponibilidade({
            barbeiroId: barbeiroEncontrado.id,
            duracaoServicoMinutos: servicoEncontrado.duracao_minutos,
            disponibilidades,
            dataInicial: dataSelecionada
          })
        : null;

    const resposta: HorariosDisponiveisResumo = {
      data: dataSelecionada.toISOString(),
      barbeiroId: barbeiroEncontrado.id,
      servicoId: servicoEncontrado.id,
      duracaoServicoMinutos: servicoEncontrado.duracao_minutos,
      gapMinutos: GAP_PADRAO_MINUTOS,
      horariosDisponiveis,
      primeiroHorarioDisponivel: horariosDisponiveis[0] ?? null,
      semHorariosDisponiveis: horariosDisponiveis.length === 0,
      proximaDisponibilidade
    };

    return resposta;
  },

  async criarAgendamento(contratanteId: string, entrada: unknown) {
    const dadosValidados = esquemaCriacaoAgendamento.parse(entrada);
    const dataAgendamento = normalizarData(dadosValidados.data);
    const dataHoraAgendamento = combinarDataHora(dataAgendamento, dadosValidados.hora);

    garantirCondicao(dataHoraAgendamento > new Date(), "Selecione um horario futuro para o agendamento.");

    const [barbearia, barbeiro, servico] = await Promise.all([
      barbeariaRepositorio.obterBarbeariaPorId(dadosValidados.barbeariaId),
      barbeiroRepositorio.obterBarbeiroPorId(dadosValidados.barbeiroId),
      servicoRepositorio.obterServicoPorId(dadosValidados.servicoId)
    ]);

    const barbeariaEncontrada = garantirExistencia(barbearia, "Barbearia nao encontrada.", 404);
    const barbeiroEncontrado = garantirExistencia(barbeiro, "Barbeiro nao encontrado.", 404);
    const servicoEncontrado = garantirExistencia(servico, "Servico nao encontrado.", 404);

    garantirCondicao(!!barbeiroEncontrado.barbearia_id, "Este barbeiro nao esta vinculado a uma barbearia.");
    garantirCondicao(
      barbeiroEncontrado.barbearia_id === barbeariaEncontrada.id,
      "O barbeiro selecionado nao pertence a esta barbearia."
    );
    garantirCondicao(
      servicoEncontrado.barbearia_id === barbeariaEncontrada.id,
      "O servico selecionado nao pertence a esta barbearia."
    );
    garantirCondicao(servicoEncontrado.ativo, "O servico selecionado nao esta disponivel.");
    garantirCondicao(barbeiroEncontrado.ativo, "O barbeiro selecionado nao esta ativo.");

    const diaSemana = obterDiaSemanaPorData(dataAgendamento);
    const disponibilidades = await disponibilidadeRepositorio.listarDisponibilidadesPorBarbeiro(barbeiroEncontrado.id);
    const disponibilidadesDoDia = disponibilidades.filter((disponibilidade) => disponibilidade.dia_semana === diaSemana);

    garantirCondicao(disponibilidadesDoDia.length > 0, "O barbeiro nao possui disponibilidade cadastrada para este dia.");

    const agendamentosAtivos = await agendamentoRepositorio.listarAgendamentosAtivosDoDiaPorBarbeiro(
      barbeiroEncontrado.id,
      dataAgendamento
    );
    const agendamentosExistentes = mapearAgendamentosExistentes(agendamentosAtivos);

    const conflitoDeHorario = possuiConflitoDeHorario({
      hora: dadosValidados.hora,
      duracaoServico: servicoEncontrado.duracao_minutos,
      gapMinutos: GAP_PADRAO_MINUTOS,
      agendamentosExistentes
    });

    garantirCondicao(!conflitoDeHorario, "Ja existe um agendamento conflitante para este barbeiro.");

    const horariosDisponiveis = gerarHorariosDisponiveis({
      intervalosDisponiveis: disponibilidadesDoDia.map((disponibilidade) => ({
        horaInicio: disponibilidade.hora_inicio,
        horaFim: disponibilidade.hora_fim
      })),
      duracaoServico: servicoEncontrado.duracao_minutos,
      gapMinutos: GAP_PADRAO_MINUTOS,
      agendamentosExistentes,
      dataReferencia: dataAgendamento
    });

    garantirCondicao(
      horariosDisponiveis.includes(dadosValidados.hora),
      "O horario selecionado nao faz parte da grade disponivel para este servico."
    );

    // Formatar data como string ISO (YYYY-MM-DD) para a coluna date do PostgreSQL
    const dataStr = dataAgendamento.toISOString().split("T")[0];

    const agendamentoCriado = await agendamentoRepositorio.criarAgendamento({
      contratante_id: contratanteId,
      barbearia_id: barbeariaEncontrada.id,
      barbeiro_id: barbeiroEncontrado.id,
      servico_id: servicoEncontrado.id,
      data: dataStr,
      hora: dadosValidados.hora,
      status: "PENDENTE",
      observacao: dadosValidados.observacao?.trim() || null
    });

    return mapearAgendamentoDetalhado(agendamentoCriado);
  },

  async cancelarAgendamento(agendamentoId: string, usuarioId: string, perfil: PerfilUsuario) {
    const agendamento = garantirExistencia(
      await agendamentoRepositorio.obterAgendamentoPorId(agendamentoId),
      "Agendamento nao encontrado.",
      404
    );

    if (perfil === "CONTRATANTE") {
      garantirCondicao(agendamento.contratante_id === usuarioId, "Voce nao pode cancelar este agendamento.", 403);
    }

    if (perfil === "PRESTADOR_PF") {
      const barbeiro = garantirExistencia(
        await barbeiroServico.obterBarbeiroPorUsuarioId(usuarioId),
        "Perfil profissional nao encontrado.",
        404
      );
      garantirCondicao(barbeiro.barbeiro.id === agendamento.barbeiro_id, "Voce nao pode cancelar este agendamento.", 403);
    }

    if (perfil === "PRESTADOR_PJ") {
      const perfilBarbearia = await barbeariaServico.obterPerfilBarbearia(usuarioId);
      const barbeariaPerfil = garantirExistencia(perfilBarbearia.barbearia, "Barbearia nao encontrada.", 404);
      garantirCondicao(
        barbeariaPerfil.id === agendamento.barbearia_id,
        "Voce nao pode cancelar este agendamento.",
        403
      );
    }

    const agendamentoCancelado = await agendamentoRepositorio.atualizarStatusAgendamento(
      agendamentoId,
      "CANCELADO"
    );

    return mapearAgendamentoDetalhado(agendamentoCancelado);
  },

  async listarAgendamentosDoContratante(contratanteId: string) {
    const listaAgendamentos = await agendamentoRepositorio.listarAgendamentosPorContratante(contratanteId);
    return listaAgendamentos.map(mapearAgendamentoDetalhado);
  },

  async listarAgendaDoProfissional(usuarioId: string) {
    const barbeiro = await barbeiroRepositorio.obterBarbeiroPorUsuarioId(usuarioId);

    if (!barbeiro) {
      return [];
    }

    return this.listarAgendaPorBarbeiroId(barbeiro.id);
  },

  async listarAgendaDaBarbearia(usuarioId: string) {
    const perfilBarbearia = await barbeariaServico.obterPerfilBarbearia(usuarioId);

    if (!perfilBarbearia.barbearia) {
      return [];
    }

    return this.listarAgendaPorBarbeariaId(perfilBarbearia.barbearia.id);
  },

  async listarAgendaPorBarbeiroId(barbeiroId: string) {
    const listaAgendamentos = await agendamentoRepositorio.listarAgendamentosPorBarbeiro(barbeiroId);
    return listaAgendamentos.map(mapearAgendamentoDetalhado);
  },

  async listarAgendaPorBarbeariaId(barbeariaId: string) {
    const listaAgendamentos = await agendamentoRepositorio.listarAgendamentosPorBarbearia(barbeariaId);
    return listaAgendamentos.map(mapearAgendamentoDetalhado);
  },

  async listarAgendamentosAdmin() {
    const listaAgendamentos = await agendamentoRepositorio.listarTodosAgendamentos();
    return listaAgendamentos.map(mapearAgendamentoDetalhado);
  },

  async obterAgendamentoPorId(agendamentoId: string) {
    const agendamento = garantirExistencia(
      await agendamentoRepositorio.obterAgendamentoPorId(agendamentoId),
      "Agendamento nao encontrado.",
      404
    );
    return mapearAgendamentoDetalhado(agendamento);
  }
};
