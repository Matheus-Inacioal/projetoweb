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
import { esquemaCriacaoAgendamento } from "@/lib/validacoes/agendamento-validacoes";
import { esquemaConsultaHorariosDisponiveis } from "@/lib/validacoes/horarios-disponiveis-validacoes";
import type { HorariosDisponiveisResumo, ProximaDisponibilidadeResumo } from "@/tipos/dados";
import type { PerfilUsuario } from "@/tipos/enums";

function mapearAgendamentosExistentes(
  agendamentosAtivos: Awaited<ReturnType<typeof agendamentoRepositorio.listarAgendamentosAtivosDoDiaPorBarbeiro>>
) {
  return agendamentosAtivos.map((agendamentoAtual) => ({
    hora: agendamentoAtual.hora,
    duracaoMinutos: agendamentoAtual.servico.duracaoMinutos
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
      .filter((disponibilidade) => disponibilidade.diaSemana === diaSemanaAtual)
      .map((disponibilidade) => ({
        horaInicio: disponibilidade.horaInicio,
        horaFim: disponibilidade.horaFim
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
      !!barbeiroEncontrado.barbeariaId && barbeiroEncontrado.barbeariaId === servicoEncontrado.barbeariaId,
      "O barbeiro selecionado nao atende este servico."
    );

    const disponibilidades = await disponibilidadeRepositorio.listarDisponibilidadesPorBarbeiro(barbeiroEncontrado.id);
    const diaSemanaSelecionado = obterDiaSemanaPorData(dataSelecionada);
    const intervalosDoDia = disponibilidades
      .filter((disponibilidade) => disponibilidade.diaSemana === diaSemanaSelecionado)
      .map((disponibilidade) => ({
        horaInicio: disponibilidade.horaInicio,
        horaFim: disponibilidade.horaFim
      }));

    const agendamentosAtivos = await agendamentoRepositorio.listarAgendamentosAtivosDoDiaPorBarbeiro(
      barbeiroEncontrado.id,
      dataSelecionada
    );

    const horariosDisponiveis = gerarHorariosDisponiveis({
      intervalosDisponiveis: intervalosDoDia,
      duracaoServico: servicoEncontrado.duracaoMinutos,
      gapMinutos: GAP_PADRAO_MINUTOS,
      agendamentosExistentes: mapearAgendamentosExistentes(agendamentosAtivos),
      dataReferencia: dataSelecionada
    });

    const proximaDisponibilidade =
      horariosDisponiveis.length === 0
        ? await buscarProximaDisponibilidade({
            barbeiroId: barbeiroEncontrado.id,
            duracaoServicoMinutos: servicoEncontrado.duracaoMinutos,
            disponibilidades,
            dataInicial: dataSelecionada
          })
        : null;

    const resposta: HorariosDisponiveisResumo = {
      data: dataSelecionada.toISOString(),
      barbeiroId: barbeiroEncontrado.id,
      servicoId: servicoEncontrado.id,
      duracaoServicoMinutos: servicoEncontrado.duracaoMinutos,
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

    garantirCondicao(!!barbeiroEncontrado.barbeariaId, "Este barbeiro nao esta vinculado a uma barbearia.");
    garantirCondicao(
      barbeiroEncontrado.barbeariaId === barbeariaEncontrada.id,
      "O barbeiro selecionado nao pertence a esta barbearia."
    );
    garantirCondicao(
      servicoEncontrado.barbeariaId === barbeariaEncontrada.id,
      "O servico selecionado nao pertence a esta barbearia."
    );
    garantirCondicao(servicoEncontrado.ativo, "O servico selecionado nao esta disponivel.");
    garantirCondicao(barbeiroEncontrado.ativo, "O barbeiro selecionado nao esta ativo.");

    const diaSemana = obterDiaSemanaPorData(dataAgendamento);
    const disponibilidades = await disponibilidadeRepositorio.listarDisponibilidadesPorBarbeiro(barbeiroEncontrado.id);
    const disponibilidadesDoDia = disponibilidades.filter((disponibilidade) => disponibilidade.diaSemana === diaSemana);

    garantirCondicao(disponibilidadesDoDia.length > 0, "O barbeiro nao possui disponibilidade cadastrada para este dia.");

    const agendamentosAtivos = await agendamentoRepositorio.listarAgendamentosAtivosDoDiaPorBarbeiro(
      barbeiroEncontrado.id,
      dataAgendamento
    );
    const agendamentosExistentes = mapearAgendamentosExistentes(agendamentosAtivos);

    const conflitoDeHorario = possuiConflitoDeHorario({
      hora: dadosValidados.hora,
      duracaoServico: servicoEncontrado.duracaoMinutos,
      gapMinutos: GAP_PADRAO_MINUTOS,
      agendamentosExistentes
    });

    garantirCondicao(!conflitoDeHorario, "Ja existe um agendamento conflitante para este barbeiro.");

    const horariosDisponiveis = gerarHorariosDisponiveis({
      intervalosDisponiveis: disponibilidadesDoDia.map((disponibilidade) => ({
        horaInicio: disponibilidade.horaInicio,
        horaFim: disponibilidade.horaFim
      })),
      duracaoServico: servicoEncontrado.duracaoMinutos,
      gapMinutos: GAP_PADRAO_MINUTOS,
      agendamentosExistentes,
      dataReferencia: dataAgendamento
    });

    garantirCondicao(
      horariosDisponiveis.includes(dadosValidados.hora),
      "O horario selecionado nao faz parte da grade disponivel para este servico."
    );

    const agendamentoCriado = await agendamentoRepositorio.criarAgendamento({
      contratanteId,
      barbeariaId: barbeariaEncontrada.id,
      barbeiroId: barbeiroEncontrado.id,
      servicoId: servicoEncontrado.id,
      data: dataAgendamento,
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
      garantirCondicao(agendamento.contratanteId === usuarioId, "Voce nao pode cancelar este agendamento.", 403);
    }

    if (perfil === "PRESTADOR_PF") {
      const barbeiro = garantirExistencia(
        await barbeiroServico.obterBarbeiroPorUsuarioId(usuarioId),
        "Perfil profissional nao encontrado.",
        404
      );
      garantirCondicao(barbeiro.barbeiro.id === agendamento.barbeiroId, "Voce nao pode cancelar este agendamento.", 403);
    }

    if (perfil === "PRESTADOR_PJ") {
      const perfilBarbearia = await barbeariaServico.obterPerfilBarbearia(usuarioId);
      const barbeariaPerfil = garantirExistencia(perfilBarbearia.barbearia, "Barbearia nao encontrada.", 404);
      garantirCondicao(
        barbeariaPerfil.id === agendamento.barbeariaId,
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
