import { combinarDataHora, converterHoraParaMinutos, converterMinutosParaHora, normalizarData } from "@/lib/utilitarios/datas";

export const GAP_PADRAO_MINUTOS = 5;

export interface IntervaloDisponivel {
  horaInicio: string;
  horaFim: string;
}

export interface AgendamentoExistenteResumo {
  hora: string;
  duracaoMinutos: number;
}

interface ParametrosConflitoHorario {
  hora: string;
  duracaoServico: number;
  gapMinutos: number;
  agendamentosExistentes: AgendamentoExistenteResumo[];
}

interface ParametrosGeracaoHorarios {
  inicioExpediente?: string;
  fimExpediente?: string;
  intervalosDisponiveis?: IntervaloDisponivel[];
  duracaoServico: number;
  gapMinutos: number;
  agendamentosExistentes: AgendamentoExistenteResumo[];
  dataReferencia?: string | Date;
  instanteAtual?: Date;
}

function normalizarIntervalosDisponiveis(params: ParametrosGeracaoHorarios) {
  if (params.intervalosDisponiveis?.length) {
    return params.intervalosDisponiveis;
  }

  if (params.inicioExpediente && params.fimExpediente) {
    return [
      {
        horaInicio: params.inicioExpediente,
        horaFim: params.fimExpediente
      }
    ];
  }

  return [];
}

export function possuiConflitoDeHorario(params: ParametrosConflitoHorario) {
  const inicioNovoAgendamento = converterHoraParaMinutos(params.hora);
  const fimNovoAgendamento = inicioNovoAgendamento + params.duracaoServico + params.gapMinutos;

  return params.agendamentosExistentes.some((agendamentoAtual) => {
    const inicioAgendamentoAtual = converterHoraParaMinutos(agendamentoAtual.hora);
    const fimAgendamentoAtual = inicioAgendamentoAtual + agendamentoAtual.duracaoMinutos + params.gapMinutos;

    return inicioNovoAgendamento < fimAgendamentoAtual && fimNovoAgendamento > inicioAgendamentoAtual;
  });
}

export function gerarHorariosDisponiveis(params: ParametrosGeracaoHorarios) {
  const intervalosDisponiveis = normalizarIntervalosDisponiveis(params);
  const duracaoTotalAtendimento = params.duracaoServico + params.gapMinutos;
  const dataReferencia = params.dataReferencia ? normalizarData(params.dataReferencia) : null;
  const instanteAtual = params.instanteAtual ?? new Date();
  const listaHorariosDisponiveis: string[] = [];

  for (const intervaloAtual of intervalosDisponiveis) {
    let horarioAtualEmMinutos = converterHoraParaMinutos(intervaloAtual.horaInicio);
    const fimIntervaloEmMinutos = converterHoraParaMinutos(intervaloAtual.horaFim);

    while (horarioAtualEmMinutos + duracaoTotalAtendimento <= fimIntervaloEmMinutos) {
      const horarioAtual = converterMinutosParaHora(horarioAtualEmMinutos);

      const horarioEstaNoPassado =
        dataReferencia !== null && combinarDataHora(dataReferencia, horarioAtual).getTime() <= instanteAtual.getTime();

      const existeConflito = possuiConflitoDeHorario({
        hora: horarioAtual,
        duracaoServico: params.duracaoServico,
        gapMinutos: params.gapMinutos,
        agendamentosExistentes: params.agendamentosExistentes
      });

      if (!horarioEstaNoPassado && !existeConflito) {
        listaHorariosDisponiveis.push(horarioAtual);
      }

      horarioAtualEmMinutos += duracaoTotalAtendimento;
    }
  }

  return listaHorariosDisponiveis;
}
