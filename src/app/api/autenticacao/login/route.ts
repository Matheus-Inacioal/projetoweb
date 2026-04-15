import { criarSessaoParaUsuario } from "@/lib/autenticacao/sessao";
import { autenticacaoServico } from "@/lib/servicos/autenticacao-servico";
import { responderErro, responderSucesso } from "@/lib/utilitarios/respostas-api";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const corpoRequisicao = await request.json();
    const resultadoLogin = await autenticacaoServico.autenticarUsuario(corpoRequisicao);

    criarSessaoParaUsuario(resultadoLogin.sessao);

    return responderSucesso(resultadoLogin, "Login realizado com sucesso.");
  } catch (erro) {
    return responderErro(erro);
  }
}
