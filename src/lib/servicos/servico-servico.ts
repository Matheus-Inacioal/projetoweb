import { barbeariaRepositorio } from "@/lib/repositorios/barbearia-repositorio";
import { servicoRepositorio } from "@/lib/repositorios/servico-repositorio";
import { garantirExistencia } from "@/lib/utilitarios/erro-aplicacao";
import { mapearServicoResumo } from "@/lib/utilitarios/mapeadores";
import { esquemaServico } from "@/lib/validacoes/servico-validacoes";

export const servicoServico = {
  async listarServicosPorBarbearia(barbeariaId: string) {
    const listaServicos = await servicoRepositorio.listarServicosPorBarbearia(barbeariaId);
    return listaServicos.map(mapearServicoResumo);
  },

  async criarServicoParaBarbearia(barbeariaId: string, entrada: unknown) {
    const dadosValidados = esquemaServico.parse(entrada);
    garantirExistencia(await barbeariaRepositorio.obterBarbeariaPorId(barbeariaId), "Barbearia nao encontrada.", 404);

    const servicoCriado = await servicoRepositorio.criarServico({
      nome: dadosValidados.nome.trim(),
      descricao: dadosValidados.descricao.trim(),
      preco: dadosValidados.preco,
      duracaoMinutos: dadosValidados.duracaoMinutos,
      ativo: dadosValidados.ativo ?? true,
      barbeariaId
    });

    return mapearServicoResumo(servicoCriado);
  }
};
