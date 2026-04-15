import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/banco/prisma";

const incluirRelacoesBarbearia = {
  responsavel: true,
  barbeiros: true,
  servicos: true
} satisfies Prisma.BarbeariaInclude;

export const barbeariaRepositorio = {
  listarBarbearias() {
    return prisma.barbearia.findMany({
      include: incluirRelacoesBarbearia,
      orderBy: {
        nome: "asc"
      }
    });
  },

  obterBarbeariaPorId(id: string) {
    return prisma.barbearia.findUnique({
      where: { id },
      include: incluirRelacoesBarbearia
    });
  },

  obterBarbeariaPorResponsavelId(responsavelId: string) {
    return prisma.barbearia.findFirst({
      where: { responsavelId },
      include: incluirRelacoesBarbearia
    });
  },

  criarBarbearia(dados: Prisma.BarbeariaUncheckedCreateInput) {
    return prisma.barbearia.create({
      data: dados,
      include: incluirRelacoesBarbearia
    });
  },

  atualizarBarbearia(id: string, dados: Prisma.BarbeariaUpdateInput) {
    return prisma.barbearia.update({
      where: { id },
      data: dados,
      include: incluirRelacoesBarbearia
    });
  },

  contarBarbearias() {
    return prisma.barbearia.count();
  }
};

