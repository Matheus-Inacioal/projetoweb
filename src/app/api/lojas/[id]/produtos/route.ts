import { produtoServico } from "@/services/produto-servico";
import { responderErro, responderSucesso } from "@/lib/utilitarios/respostas-api";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const produtos = await produtoServico.listarProdutos({
      lojaId: params.id,
      apenasAtivos: true
    });
    return responderSucesso(produtos, "Produtos da loja carregados com sucesso.");
  } catch (erro) {
    return responderErro(erro);
  }
}
