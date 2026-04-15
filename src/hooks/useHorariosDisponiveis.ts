"use client";

import { useBuscarDados } from "@/hooks/useBuscarDados";
import type { HorariosDisponiveisResumo } from "@/tipos/dados";

export function useHorariosDisponiveis(barbeiroId?: string, servicoId?: string, data?: string) {
  const url =
    barbeiroId && servicoId && data
      ? `/api/barbeiros/${barbeiroId}/horarios-disponiveis?data=${encodeURIComponent(data)}&servicoId=${encodeURIComponent(servicoId)}`
      : null;

  return useBuscarDados<HorariosDisponiveisResumo>(url);
}
