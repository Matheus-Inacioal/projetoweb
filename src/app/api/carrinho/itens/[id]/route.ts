import { obterSessaoObrigatoriaApi } from "@/lib/autenticacao/sessao";
import { carrinhoServico } from "@/services/carrinho-servico";
import { responderErro, responderSucesso } from "@/lib/utilitarios/respostas-api";
import { ErroAplicacao } from "@/lib/utilitarios/erro-aplicacao";

export const dynamic = "force-dynamic";

interface Params {
  params: {
    id: string;
  };
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const sessao = await obterSessaoObrigatoriaApi(["consumidor"]);
    const { quantidade } = await request.json();

    if (quantidade === undefined || quantidade <= 0) {
      throw new ErroAplicacao("Quantidade inválida.", 400);
    }

    const item = await carrinhoServico.atualizarItem(sessao.usuarioId, params.id, Number(quantidade));
    return responderSucesso(item, "Quantidade do item atualizada com sucesso.");
  } catch (erro) {
    return responderErro(erro);
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    const sessao = await obterSessaoObrigatoriaApi(["consumidor"]);
    await carrinhoServico.removerItem(sessao.usuarioId, params.id);
    return responderSucesso(null, "Item removido do carrinho com sucesso.");
  } catch (erro) {
    return responderErro(erro);
  }
}
