import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/banco/prisma";

export const servicoRepositorio = {
  listarServicosPorBarbearia(barbeariaId: string) {
    return prisma.servico.findMany({
      where: {
        barbeariaId
      },
      orderBy: {
        nome: "asc"
      }
    });
  },

  obterServicoPorId(id: string) {
    return prisma.servico.findUnique({
      where: { id }
    });
  },

  criarServico(dados: Prisma.ServicoUncheckedCreateInput) {
    return prisma.servico.create({
      data: dados
    });
  },

  atualizarServico(id: string, dados: Prisma.ServicoUpdateInput) {
    return prisma.servico.update({
      where: { id },
      data: dados
    });
  }
};

