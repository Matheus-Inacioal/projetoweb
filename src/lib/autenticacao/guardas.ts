import { redirect } from "next/navigation";
import { obterSessaoAtual } from "@/lib/autenticacao/sessao";
import type { TipoUsuario } from "@/tipos/enums";

export async function exigirSessao(tiposPermitidos?: TipoUsuario[]) {
  const sessao = await obterSessaoAtual();

  if (!sessao) {
    redirect("/login");
  }

  if (tiposPermitidos && !tiposPermitidos.includes(sessao.tipo)) {
    redirect("/");
  }

  return sessao;
}
