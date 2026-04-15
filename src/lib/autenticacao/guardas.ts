import { redirect } from "next/navigation";
import { obterSessaoAtual } from "@/lib/autenticacao/sessao";
import type { PerfilUsuario } from "@/tipos/enums";

export function exigirSessao(perfisPermitidos?: PerfilUsuario[]) {
  const sessao = obterSessaoAtual();

  if (!sessao) {
    redirect("/login");
  }

  if (perfisPermitidos && !perfisPermitidos.includes(sessao.perfil)) {
    redirect("/");
  }

  return sessao;
}

