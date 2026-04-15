"use client";

import type { AgendamentoDetalhado, BarbeariaResumo, ResumoPainelAdmin, UsuarioResumo } from "@/tipos/dados";
import { useBuscarDados } from "@/hooks/useBuscarDados";

export function useResumoAdmin() {
  return useBuscarDados<ResumoPainelAdmin>("/api/admin/resumo");
}

export function useUsuariosAdmin() {
  return useBuscarDados<UsuarioResumo[]>("/api/admin/usuarios");
}

export function useBarbeariasAdmin() {
  return useBuscarDados<BarbeariaResumo[]>("/api/admin/barbearias");
}

export function useAgendamentosAdmin() {
  return useBuscarDados<AgendamentoDetalhado[]>("/api/admin/agendamentos");
}

