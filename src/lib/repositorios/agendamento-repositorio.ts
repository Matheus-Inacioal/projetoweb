import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/banco/prisma";
import type { StatusAgendamento } from "@/tipos/enums";

const incluirRelacoesAgendamento = {
  contratante: true,
  barbearia: true,
  barbeiro: true,
  servico: true,
  avaliacao: true
} satisfies Prisma.AgendamentoInclude;

export const agendamentoRepositorio = {
  criarAgendamento(dados: Prisma.AgendamentoUncheckedCreateInput) {
    return prisma.agendamento.create({
      data: dados,
      include: incluirRelacoesAgendamento
    });
  },

  obterAgendamentoPorId(id: string) {
    return prisma.agendamento.findUnique({
      where: { id },
      include: incluirRelacoesAgendamento
    });
  },

  listarAgendamentosPorContratante(contratanteId: string) {
    return prisma.agendamento.findMany({
      where: { contratanteId },
      include: incluirRelacoesAgendamento,
      orderBy: [{ data: "asc" }, { hora: "asc" }]
    });
  },

  listarAgendamentosPorBarbeiro(barbeiroId: string) {
    return prisma.agendamento.findMany({
      where: { barbeiroId },
      include: incluirRelacoesAgendamento,
      orderBy: [{ data: "asc" }, { hora: "asc" }]
    });
  },

  listarAgendamentosPorBarbearia(barbeariaId: string) {
    return prisma.agendamento.findMany({
      where: { barbeariaId },
      include: incluirRelacoesAgendamento,
      orderBy: [{ data: "asc" }, { hora: "asc" }]
    });
  },

  listarAgendamentosDoDiaPorBarbeiro(barbeiroId: string, data: Date) {
    const inicio = new Date(data);
    inicio.setHours(0, 0, 0, 0);

    const fim = new Date(inicio);
    fim.setDate(fim.getDate() + 1);

    return prisma.agendamento.findMany({
      where: {
        barbeiroId,
        data: {
          gte: inicio,
          lt: fim
        }
      },
      include: incluirRelacoesAgendamento,
      orderBy: [{ hora: "asc" }]
    });
  },

  listarAgendamentosDoDiaPorBarbearia(barbeariaId: string, data: Date) {
    const inicio = new Date(data);
    inicio.setHours(0, 0, 0, 0);

    const fim = new Date(inicio);
    fim.setDate(fim.getDate() + 1);

    return prisma.agendamento.findMany({
      where: {
        barbeariaId,
        data: {
          gte: inicio,
          lt: fim
        }
      },
      include: incluirRelacoesAgendamento,
      orderBy: [{ hora: "asc" }]
    });
  },

  listarAgendamentosAtivosDoDiaPorBarbeiro(barbeiroId: string, data: Date) {
    const inicio = new Date(data);
    inicio.setHours(0, 0, 0, 0);

    const fim = new Date(inicio);
    fim.setDate(fim.getDate() + 1);

    return prisma.agendamento.findMany({
      where: {
        barbeiroId,
        status: {
          not: "CANCELADO"
        },
        data: {
          gte: inicio,
          lt: fim
        }
      },
      include: incluirRelacoesAgendamento,
      orderBy: [{ hora: "asc" }]
    });
  },

  atualizarStatusAgendamento(id: string, status: StatusAgendamento) {
    return prisma.agendamento.update({
      where: { id },
      data: { status },
      include: incluirRelacoesAgendamento
    });
  },

  listarTodosAgendamentos() {
    return prisma.agendamento.findMany({
      include: incluirRelacoesAgendamento,
      orderBy: [{ data: "desc" }, { hora: "desc" }]
    });
  },

  contarAgendamentos() {
    return prisma.agendamento.count();
  },

  contarAgendamentosPorStatus(status: StatusAgendamento) {
    return prisma.agendamento.count({
      where: { status }
    });
  }
};
