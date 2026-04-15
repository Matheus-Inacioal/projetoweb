import { obterSessaoAtual } from "@/lib/autenticacao/sessao";
import { responderErro, responderSucesso } from "@/lib/utilitarios/respostas-api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return responderSucesso(obterSessaoAtual(), "Sessao carregada com sucesso.");
  } catch (erro) {
    return responderErro(erro);
  }
}
