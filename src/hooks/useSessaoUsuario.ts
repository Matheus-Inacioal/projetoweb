"use client";

import type { SessaoUsuario } from "@/tipos/dados";
import { useBuscarDados } from "@/hooks/useBuscarDados";

export function useSessaoUsuario() {
  return useBuscarDados<SessaoUsuario | null>("/api/sessao");
}

