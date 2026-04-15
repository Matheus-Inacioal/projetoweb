import { agendamentoRepositorio } from "@/lib/repositorios/agendamento-repositorio";
import { barbeariaRepositorio } from "@/lib/repositorios/barbearia-repositorio";
import { usuarioRepositorio } from "@/lib/repositorios/usuario-repositorio";
import { garantirCondicao, garantirExistencia } from "@/lib/utilitarios/erro-aplicacao";
import { mapearAgendamentoDetalhado, mapearBarbeariaDetalhada, mapearBarbeariaResumo, mapearUsuarioResumo } from "@/lib/utilitarios/mapeadores";
import { esquemaBarbearia } from "@/lib/validacoes/barbearia-validacoes";

export const barbeariaServico = {
  async listarBarbearias() {
    const listaBarbearias = await barbeariaRepositorio.listarBarbearias();
    return listaBarbearias.map(mapearBarbeariaResumo);
  },

  async obterBarbeariaPorId(barbeariaId: string) {
    const barbearia = garantirExistencia(
      await barbeariaRepositorio.obterBarbeariaPorId(barbeariaId),
      "Barbearia nao encontrada.",
      404
    );
    return mapearBarbeariaDetalhada(barbearia);
  },

  async obterPerfilBarbearia(responsavelId: string) {
    const [usuario, barbearia] = await Promise.all([
      usuarioRepositorio.obterUsuarioPorId(responsavelId),
      barbeariaRepositorio.obterBarbeariaPorResponsavelId(responsavelId)
    ]);

    const usuarioAtual = garantirExistencia(usuario, "Usuario nao encontrado.", 404);

    if (!barbearia) {
      return {
        usuario: mapearUsuarioResumo(usuarioAtual),
        barbearia: null,
        barbeiros: [],
        servicos: [],
        agendaHoje: []
      };
    }

    const agendaHoje = await agendamentoRepositorio.listarAgendamentosDoDiaPorBarbearia(barbearia.id, new Date());

    const barbeariaMapeada = mapearBarbeariaDetalhada(barbearia);

    return {
      usuario: mapearUsuarioResumo(usuarioAtual),
      barbearia: {
        ...barbeariaMapeada
      },
      barbeiros: barbeariaMapeada.barbeiros,
      servicos: barbeariaMapeada.servicos,
      agendaHoje: agendaHoje.map(mapearAgendamentoDetalhado)
    };
  },

  async salvarPerfilBarbearia(responsavelId: string, entrada: unknown) {
    const dadosValidados = esquemaBarbearia.parse(entrada);
    const barbeariaExistente = await barbeariaRepositorio.obterBarbeariaPorResponsavelId(responsavelId);

    if (!barbeariaExistente) {
      const barbeariaCriada = await barbeariaRepositorio.criarBarbearia({
        nome: dadosValidados.nome.trim(),
        descricao: dadosValidados.descricao.trim(),
        endereco: dadosValidados.endereco.trim(),
        telefone: dadosValidados.telefone.trim(),
        responsavelId
      });

      return mapearBarbeariaDetalhada(barbeariaCriada);
    }

    const barbeariaAtualizada = await barbeariaRepositorio.atualizarBarbearia(barbeariaExistente.id, {
      nome: dadosValidados.nome.trim(),
      descricao: dadosValidados.descricao.trim(),
      endereco: dadosValidados.endereco.trim(),
      telefone: dadosValidados.telefone.trim()
    });

    return mapearBarbeariaDetalhada(barbeariaAtualizada);
  },

  async listarBarbeariasAdmin() {
    const listaBarbearias = await barbeariaRepositorio.listarBarbearias();
    return listaBarbearias.map(mapearBarbeariaResumo);
  }
};
