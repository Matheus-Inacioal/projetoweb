import { encerrarSessaoUsuario } from "@/lib/autenticacao/sessao";
import { responderErro, responderSucesso } from "@/lib/utilitarios/respostas-api";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    encerrarSessaoUsuario();
    return responderSucesso(null, "Sessao encerrada com sucesso.");
  } catch (erro) {
    return responderErro(erro);
  }
}
