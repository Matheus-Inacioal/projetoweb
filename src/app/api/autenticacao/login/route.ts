import { autenticacaoServico } from "@/services/autenticacao-servico";
import { responderErro, responderSucesso } from "@/lib/utilitarios/respostas-api";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { email, senha } = await request.json();
    const resultadoLogin = await autenticacaoServico.login(email, senha);

    return responderSucesso(resultadoLogin, "Login realizado com sucesso.");
  } catch (erro) {
    return responderErro(erro);
  }
}
