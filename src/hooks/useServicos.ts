"use client";

import type { ServicoResumo } from "@/tipos/dados";
import { useBuscarDados } from "@/hooks/useBuscarDados";

export function useServicosPorBarbearia(barbeariaId?: string) {
  return useBuscarDados<ServicoResumo[]>(barbeariaId ? `/api/barbearias/${barbeariaId}/servicos` : null);
}

