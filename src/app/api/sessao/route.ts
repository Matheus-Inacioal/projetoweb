import { obterSessaoAtual } from "@/lib/autenticacao/sessao";
import { responderErro, responderSucesso } from "@/lib/utilitarios/respostas-api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const sessao = await obterSessaoAtual();
    return responderSucesso(sessao, "Sessao carregada com sucesso.");
  } catch (erro) {
    return responderErro(erro);
  }
}
