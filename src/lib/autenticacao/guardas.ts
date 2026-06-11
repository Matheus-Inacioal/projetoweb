import { redirect } from "next/navigation";
import { obterSessaoAtual } from "@/lib/autenticacao/sessao";
import type { PerfilUsuario } from "@/tipos/enums";

export async function exigirSessao(perfisPermitidos?: PerfilUsuario[]) {
  const sessao = await obterSessaoAtual();

  if (!sessao) {
    redirect("/login");
  }

  if (perfisPermitidos && !perfisPermitidos.includes(sessao.perfil)) {
    redirect("/");
  }

  return sessao;
}
