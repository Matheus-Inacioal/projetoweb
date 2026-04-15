import { barbeiroRepositorio } from "@/lib/repositorios/barbeiro-repositorio";
import { disponibilidadeRepositorio } from "@/lib/repositorios/disponibilidade-repositorio";
import { converterHoraParaMinutos } from "@/lib/utilitarios/datas";
import { garantirCondicao, garantirExistencia } from "@/lib/utilitarios/erro-aplicacao";
import { mapearDisponibilidadeResumo } from "@/lib/utilitarios/mapeadores";
import { esquemaDisponibilidade } from "@/lib/validacoes/disponibilidade-validacoes";

export const disponibilidadeServico = {
  async listarDisponibilidadesPorBarbeiro(barbeiroId: string) {
    const listaDisponibilidades = await disponibilidadeRepositorio.listarDisponibilidadesPorBarbeiro(barbeiroId);
    return listaDisponibilidades.map(mapearDisponibilidadeResumo);
  },

  async criarDisponibilidade(barbeiroId: string, entrada: unknown) {
    const dadosValidados = esquemaDisponibilidade.parse(entrada);
    garantirExistencia(await barbeiroRepositorio.obterBarbeiroPorId(barbeiroId), "Barbeiro nao encontrado.", 404);

    const horaInicioMinutos = converterHoraParaMinutos(dadosValidados.horaInicio);
    const horaFimMinutos = converterHoraParaMinutos(dadosValidados.horaFim);

    garantirCondicao(horaFimMinutos > horaInicioMinutos, "O horario final precisa ser maior que o horario inicial.");

    const disponibilidadesExistentes = await disponibilidadeRepositorio.listarDisponibilidadesPorBarbeiro(barbeiroId);

    const existeConflito = disponibilidadesExistentes.some((disponibilidadeAtual) => {
      if (disponibilidadeAtual.diaSemana !== dadosValidados.diaSemana) {
        return false;
      }

      const inicioExistente = converterHoraParaMinutos(disponibilidadeAtual.horaInicio);
      const fimExistente = converterHoraParaMinutos(disponibilidadeAtual.horaFim);

      return horaInicioMinutos < fimExistente && horaFimMinutos > inicioExistente;
    });

    garantirCondicao(!existeConflito, "Ja existe uma disponibilidade cadastrada para este intervalo.");

    const disponibilidadeCriada = await disponibilidadeRepositorio.criarDisponibilidade({
      barbeiroId,
      diaSemana: dadosValidados.diaSemana,
      horaInicio: dadosValidados.horaInicio,
      horaFim: dadosValidados.horaFim
    });

    return mapearDisponibilidadeResumo(disponibilidadeCriada);
  }
};
