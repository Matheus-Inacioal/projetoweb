"use client";

import type { AgendamentoDetalhado } from "@/tipos/dados";
import { useBuscarDados } from "@/hooks/useBuscarDados";

export function useAgendamentos() {
  return useBuscarDados<AgendamentoDetalhado[]>("/api/agendamentos");
}

export function useAgendaBarbeiro(barbeiroId?: string) {
  return useBuscarDados<AgendamentoDetalhado[]>(barbeiroId ? `/api/barbeiros/${barbeiroId}/agenda` : null);
}

