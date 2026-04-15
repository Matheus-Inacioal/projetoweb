import { agendamentoRepositorio } from "@/lib/repositorios/agendamento-repositorio";
import { barbeariaRepositorio } from "@/lib/repositorios/barbearia-repositorio";
import { barbeiroRepositorio } from "@/lib/repositorios/barbeiro-repositorio";
import { usuarioRepositorio } from "@/lib/repositorios/usuario-repositorio";
import { garantirCondicao, garantirExistencia } from "@/lib/utilitarios/erro-aplicacao";
import {
  mapearAgendamentoDetalhado,
  mapearBarbeiroResumo,
  mapearDisponibilidadeResumo,
  mapearUsuarioResumo
} from "@/lib/utilitarios/mapeadores";
import { esquemaBarbeiro } from "@/lib/validacoes/barbeiro-validacoes";

export const barbeiroServico = {
  async listarBarbeirosPorBarbearia(barbeariaId: string) {
    const listaBarbeiros = await barbeiroRepositorio.listarBarbeirosPorBarbearia(barbeariaId);
    return listaBarbeiros.map(mapearBarbeiroResumo);
  },

  async obterBarbeiroPorId(barbeiroId: string) {
    const barbeiro = garantirExistencia(await barbeiroRepositorio.obterBarbeiroPorId(barbeiroId), "Barbeiro nao encontrado.", 404);
    return {
      barbeiro: mapearBarbeiroResumo(barbeiro),
      disponibilidades: barbeiro.disponibilidades.map(mapearDisponibilidadeResumo)
    };
  },

  async obterPerfilProfissional(usuarioId: string) {
    const [usuario, barbeiro] = await Promise.all([
      usuarioRepositorio.obterUsuarioPorId(usuarioId),
      barbeiroRepositorio.obterBarbeiroPorUsuarioId(usuarioId)
    ]);

    const usuarioAtual = garantirExistencia(usuario, "Usuario nao encontrado.", 404);

    if (!barbeiro) {
      return {
        usuario: mapearUsuarioResumo(usuarioAtual),
        barbeiro: null,
        disponibilidades: [],
        agendaHoje: []
      };
    }

    const agendaHoje = await agendamentoRepositorio.listarAgendamentosDoDiaPorBarbeiro(barbeiro.id, new Date());

    return {
      usuario: mapearUsuarioResumo(usuarioAtual),
      barbeiro: mapearBarbeiroResumo(barbeiro),
      disponibilidades: barbeiro.disponibilidades.map(mapearDisponibilidadeResumo),
      agendaHoje: agendaHoje.map(mapearAgendamentoDetalhado)
    };
  },

  async salvarPerfilProfissional(usuarioId: string, entrada: unknown) {
    const dadosValidados = esquemaBarbeiro.parse(entrada);
    const barbeiroExistente = await barbeiroRepositorio.obterBarbeiroPorUsuarioId(usuarioId);

    if (!barbeiroExistente) {
      const barbeiroCriado = await barbeiroRepositorio.criarBarbeiro({
        nome: dadosValidados.nome.trim(),
        especialidade: dadosValidados.especialidade.trim(),
        descricao: dadosValidados.descricao.trim(),
        telefone: dadosValidados.telefone.trim(),
        ativo: dadosValidados.ativo ?? true,
        usuarioId,
        barbeariaId: dadosValidados.barbeariaId ?? null
      });

      return {
        barbeiro: mapearBarbeiroResumo(barbeiroCriado),
        disponibilidades: barbeiroCriado.disponibilidades.map(mapearDisponibilidadeResumo)
      };
    }

    const barbeiroAtualizado = await barbeiroRepositorio.atualizarBarbeiro(barbeiroExistente.id, {
      nome: dadosValidados.nome.trim(),
      especialidade: dadosValidados.especialidade.trim(),
      descricao: dadosValidados.descricao.trim(),
      telefone: dadosValidados.telefone.trim(),
      ativo: dadosValidados.ativo ?? barbeiroExistente.ativo
    });

    return {
      barbeiro: mapearBarbeiroResumo(barbeiroAtualizado),
      disponibilidades: barbeiroAtualizado.disponibilidades.map(mapearDisponibilidadeResumo)
    };
  },

  async criarBarbeiroParaBarbearia(barbeariaId: string, entrada: unknown) {
    const dadosValidados = esquemaBarbeiro.parse(entrada);
    garantirExistencia(await barbeariaRepositorio.obterBarbeariaPorId(barbeariaId), "Barbearia nao encontrada.", 404);

    const barbeiroCriado = await barbeiroRepositorio.criarBarbeiro({
      nome: dadosValidados.nome.trim(),
      especialidade: dadosValidados.especialidade.trim(),
      descricao: dadosValidados.descricao.trim(),
      telefone: dadosValidados.telefone.trim(),
      ativo: dadosValidados.ativo ?? true,
      barbeariaId
    });

    return {
      barbeiro: mapearBarbeiroResumo(barbeiroCriado),
      disponibilidades: barbeiroCriado.disponibilidades.map(mapearDisponibilidadeResumo)
    };
  },

  async obterBarbeiroPorUsuarioId(usuarioId: string) {
    const barbeiro = await barbeiroRepositorio.obterBarbeiroPorUsuarioId(usuarioId);
    return barbeiro
      ? {
          barbeiro: mapearBarbeiroResumo(barbeiro),
          disponibilidades: barbeiro.disponibilidades.map(mapearDisponibilidadeResumo)
        }
      : null;
  }
};
