"use client";

import type { BarbeariaDetalhada, BarbeariaResumo } from "@/tipos/dados";
import { useBuscarDados } from "@/hooks/useBuscarDados";

export function useBarbearias() {
  return useBuscarDados<BarbeariaResumo[]>("/api/barbearias");
}

export function useBarbeariaDetalhes(barbeariaId?: string) {
  return useBuscarDados<BarbeariaDetalhada>(barbeariaId ? `/api/barbearias/${barbeariaId}` : null);
}

