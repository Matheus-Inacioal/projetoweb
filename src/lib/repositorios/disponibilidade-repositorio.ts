import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/banco/prisma";
import type { DiaSemana } from "@/tipos/enums";

export const disponibilidadeRepositorio = {
  listarDisponibilidadesPorBarbeiro(barbeiroId: string) {
    return prisma.disponibilidade.findMany({
      where: {
        barbeiroId
      },
      orderBy: [
        { diaSemana: "asc" },
        { horaInicio: "asc" }
      ]
    });
  },

  criarDisponibilidade(dados: Prisma.DisponibilidadeUncheckedCreateInput) {
    return prisma.disponibilidade.create({
      data: dados
    });
  },

  listarDisponibilidadesPorBarbeiroEDia(barbeiroId: string, diaSemana: DiaSemana) {
    return prisma.disponibilidade.findMany({
      where: {
        barbeiroId,
        diaSemana
      },
      orderBy: {
        horaInicio: "asc"
      }
    });
  }
};
