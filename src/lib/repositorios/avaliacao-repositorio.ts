import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/banco/prisma";

export const avaliacaoRepositorio = {
  obterAvaliacaoPorAgendamentoId(agendamentoId: string) {
    return prisma.avaliacao.findUnique({
      where: {
        agendamentoId
      }
    });
  },

  criarAvaliacao(dados: Prisma.AvaliacaoUncheckedCreateInput) {
    return prisma.avaliacao.create({
      data: dados
    });
  }
};

