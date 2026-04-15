import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/banco/prisma";

const incluirRelacoesBarbeiro = {
  barbearia: true
} satisfies Prisma.BarbeiroInclude;

export const barbeiroRepositorio = {
  listarBarbeirosPorBarbearia(barbeariaId: string) {
    return prisma.barbeiro.findMany({
      where: {
        barbeariaId
      },
      include: incluirRelacoesBarbeiro,
      orderBy: {
        nome: "asc"
      }
    });
  },

  obterBarbeiroPorId(id: string) {
    return prisma.barbeiro.findUnique({
      where: { id },
      include: {
        ...incluirRelacoesBarbeiro,
        disponibilidades: true
      }
    });
  },

  obterBarbeiroPorUsuarioId(usuarioId: string) {
    return prisma.barbeiro.findUnique({
      where: { usuarioId },
      include: {
        ...incluirRelacoesBarbeiro,
        disponibilidades: true
      }
    });
  },

  criarBarbeiro(dados: Prisma.BarbeiroUncheckedCreateInput) {
    return prisma.barbeiro.create({
      data: dados,
      include: {
        ...incluirRelacoesBarbeiro,
        disponibilidades: true
      }
    });
  },

  atualizarBarbeiro(id: string, dados: Prisma.BarbeiroUpdateInput) {
    return prisma.barbeiro.update({
      where: { id },
      data: dados,
      include: {
        ...incluirRelacoesBarbeiro,
        disponibilidades: true
      }
    });
  }
};

