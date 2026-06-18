import { obterSessaoObrigatoriaApi } from "@/lib/autenticacao/sessao";
import { carrinhoServico } from "@/services/carrinho-servico";
import { responderErro, responderSucesso } from "@/lib/utilitarios/respostas-api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const sessao = await obterSessaoObrigatoriaApi(["consumidor"]);
    const carrinho = await carrinhoServico.obterCarrinho(sessao.usuarioId);
    return responderSucesso(carrinho, "Carrinho de compras carregado com sucesso.");
  } catch (erro) {
    return responderErro(erro);
  }
}

export async function DELETE() {
  try {
    const sessao = await obterSessaoObrigatoriaApi(["consumidor"]);
    await carrinhoServico.limparCarrinho(sessao.usuarioId);
    return responderSucesso(null, "Carrinho limpo com sucesso.");
  } catch (erro) {
    return responderErro(erro);
  }
}
