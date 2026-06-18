import { obterSessaoObrigatoriaApi } from "@/lib/autenticacao/sessao";
import { carrinhoServico } from "@/services/carrinho-servico";
import { responderErro, responderSucesso } from "@/lib/utilitarios/respostas-api";
import { ErroAplicacao } from "@/lib/utilitarios/erro-aplicacao";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const sessao = await obterSessaoObrigatoriaApi(["consumidor"]);
    const { produtoId, quantidade } = await request.json();

    if (!produtoId || quantidade === undefined || quantidade <= 0) {
      throw new ErroAplicacao("Campos obrigatórios inválidos ou ausentes (produtoId, quantidade).", 400);
    }

    const item = await carrinhoServico.adicionarItem(sessao.usuarioId, produtoId, Number(quantidade));
    return responderSucesso(item, "Item adicionado ao carrinho com sucesso.", 201);
  } catch (erro) {
    return responderErro(erro);
  }
}
