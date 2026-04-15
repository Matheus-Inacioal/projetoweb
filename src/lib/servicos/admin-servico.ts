import { agendamentoRepositorio } from "@/lib/repositorios/agendamento-repositorio";
import { barbeariaRepositorio } from "@/lib/repositorios/barbearia-repositorio";
import { usuarioRepositorio } from "@/lib/repositorios/usuario-repositorio";
import { mapearAgendamentoDetalhado, mapearBarbeariaResumo, mapearUsuarioResumo } from "@/lib/utilitarios/mapeadores";

export const adminServico = {
  async obterResumoAdmin() {
    const [totalUsuarios, totalBarbearias, totalAgendamentos, agendamentosPendentes, agendamentosConfirmados] =
      await Promise.all([
        usuarioRepositorio.contarUsuarios(),
        barbeariaRepositorio.contarBarbearias(),
        agendamentoRepositorio.contarAgendamentos(),
        agendamentoRepositorio.contarAgendamentosPorStatus("PENDENTE"),
        agendamentoRepositorio.contarAgendamentosPorStatus("CONFIRMADO")
      ]);

    return {
      totalUsuarios,
      totalBarbearias,
      totalAgendamentos,
      agendamentosPendentes,
      agendamentosConfirmados
    };
  },

  async listarUsuarios() {
    const usuarios = await usuarioRepositorio.listarUsuarios();
    return usuarios.map(mapearUsuarioResumo);
  },

  async listarBarbearias() {
    const listaBarbearias = await barbeariaRepositorio.listarBarbearias();
    return listaBarbearias.map(mapearBarbeariaResumo);
  },

  async listarAgendamentos() {
    const listaAgendamentos = await agendamentoRepositorio.listarTodosAgendamentos();
    return listaAgendamentos.map(mapearAgendamentoDetalhado);
  }
};
