"use client";

import type { PerfilBarbearia, PerfilContratante, PerfilProfissional } from "@/tipos/dados";
import { useBuscarDados } from "@/hooks/useBuscarDados";

export function usePerfilContratante() {
  return useBuscarDados<PerfilContratante>("/api/usuarios/perfil");
}

export function usePerfilProfissional() {
  return useBuscarDados<PerfilProfissional>("/api/profissional/perfil");
}

export function usePerfilBarbearia() {
  return useBuscarDados<PerfilBarbearia>("/api/barbearia/perfil");
}

