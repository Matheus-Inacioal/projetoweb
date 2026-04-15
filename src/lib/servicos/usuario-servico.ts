import { agendamentoRepositorio } from "@/lib/repositorios/agendamento-repositorio";
import { usuarioRepositorio } from "@/lib/repositorios/usuario-repositorio";
import { combinarDataHora } from "@/lib/utilitarios/datas";
import { garantirCondicao, garantirExistencia } from "@/lib/utilitarios/erro-aplicacao";
import { mapearAgendamentoDetalhado, mapearUsuarioResumo } from "@/lib/utilitarios/mapeadores";
import { esquemaAtualizacaoUsuario } from "@/lib/validacoes/usuario-validacoes";

function separarProximosEHistorico(listaAgendamentos: ReturnType<typeof mapearAgendamentoDetalhado>[]) {
  const agora = new Date();

  return listaAgendamentos.reduce(
    (acumulador, agendamento) => {
      const dataHoraAgendamento = combinarDataHora(agendamento.data, agendamento.hora);

      if (dataHoraAgendamento >= agora && agendamento.status !== "CANCELADO") {
        acumulador.proximosAgendamentos.push(agendamento);
      } else {
        acumulador.historicoAgendamentos.push(agendamento);
      }

      return acumulador;
    },
    {
      proximosAgendamentos: [] as ReturnType<typeof mapearAgendamentoDetalhado>[],
      historicoAgendamentos: [] as ReturnType<typeof mapearAgendamentoDetalhado>[]
    }
  );
}

export const usuarioServico = {
  async obterPerfilContratante(usuarioId: string) {
    const [usuario, listaAgendamentos] = await Promise.all([
      usuarioRepositorio.obterUsuarioPorId(usuarioId),
      agendamentoRepositorio.listarAgendamentosPorContratante(usuarioId)
    ]);

    const usuarioAtual = garantirExistencia(usuario, "Usuario nao encontrado.", 404);

    const agendamentosMapeados = listaAgendamentos.map(mapearAgendamentoDetalhado);
    const agendamentosSeparados = separarProximosEHistorico(agendamentosMapeados);

    return {
      usuario: mapearUsuarioResumo(usuarioAtual),
      ...agendamentosSeparados
    };
  },

  async atualizarPerfilUsuario(usuarioId: string, entrada: unknown) {
    const dadosValidados = esquemaAtualizacaoUsuario.parse(entrada);
    const usuarioAtual = garantirExistencia(await usuarioRepositorio.obterUsuarioPorId(usuarioId), "Usuario nao encontrado.", 404);

    if (usuarioAtual.email !== dadosValidados.email.trim().toLowerCase()) {
      const usuarioComEmail = await usuarioRepositorio.obterUsuarioPorEmail(dadosValidados.email.trim().toLowerCase());
      garantirCondicao(!usuarioComEmail, "Ja existe um usuario com este e-mail.", 409);
    }

    const usuarioAtualizado = await usuarioRepositorio.atualizarUsuario(usuarioId, {
      nome: dadosValidados.nome.trim(),
      email: dadosValidados.email.trim().toLowerCase()
    });

    return mapearUsuarioResumo(usuarioAtualizado);
  },

  async listarUsuariosAdmin() {
    const usuarios = await usuarioRepositorio.listarUsuarios();
    return usuarios.map(mapearUsuarioResumo);
  }
};
