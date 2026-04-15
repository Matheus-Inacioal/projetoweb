import { criarSessaoParaUsuario } from "@/lib/autenticacao/sessao";
import { autenticacaoServico } from "@/lib/servicos/autenticacao-servico";
import { responderErro, responderSucesso } from "@/lib/utilitarios/respostas-api";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const corpoRequisicao = await request.json();
    const resultadoCadastro = await autenticacaoServico.cadastrarUsuario(corpoRequisicao);

    criarSessaoParaUsuario(resultadoCadastro.sessao);

    return responderSucesso(resultadoCadastro, "Cadastro realizado com sucesso.", 201);
  } catch (erro) {
    return responderErro(erro);
  }
}
