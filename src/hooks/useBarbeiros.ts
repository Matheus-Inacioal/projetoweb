"use client";

import type { BarbeiroResumo, DisponibilidadeResumo } from "@/tipos/dados";
import { useBuscarDados } from "@/hooks/useBuscarDados";

export function useBarbeirosPorBarbearia(barbeariaId?: string) {
  return useBuscarDados<BarbeiroResumo[]>(barbeariaId ? `/api/barbearias/${barbeariaId}/barbeiros` : null);
}

export function useDetalhesBarbeiro(barbeiroId?: string) {
  return useBuscarDados<{ barbeiro: BarbeiroResumo; disponibilidades: DisponibilidadeResumo[] }>(
    barbeiroId ? `/api/barbeiros/${barbeiroId}` : null
  );
}

export function useDisponibilidadesBarbeiro(barbeiroId?: string) {
  return useBuscarDados<DisponibilidadeResumo[]>(barbeiroId ? `/api/barbeiros/${barbeiroId}/disponibilidades` : null);
}

