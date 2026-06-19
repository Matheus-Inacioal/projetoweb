import { autenticacaoServico } from "@/services/autenticacao-servico";
import { responderErro, responderSucesso } from "@/lib/utilitarios/respostas-api";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { email, senha, nome, telefone, tipo, ...metadataExtra } = await request.json();
    const resultadoCadastro = await autenticacaoServico.cadastrar(email, senha, nome, telefone, tipo, metadataExtra);

    return responderSucesso(resultadoCadastro, "Cadastro realizado com sucesso.", 201);
  } catch (erro) {
    return responderErro(erro);
  }
}
