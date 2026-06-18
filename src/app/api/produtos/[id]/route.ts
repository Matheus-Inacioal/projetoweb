import { obterSessaoObrigatoriaApi } from "@/lib/autenticacao/sessao";
import { produtoServico } from "@/services/produto-servico";
import { prestadorServico } from "@/services/prestador-servico";
import { responderErro, responderSucesso } from "@/lib/utilitarios/respostas-api";
import { ErroAplicacao } from "@/lib/utilitarios/erro-aplicacao";

export const dynamic = "force-dynamic";

interface Params {
  params: {
    id: string;
  };
}

export async function GET(request: Request, { params }: Params) {
  try {
    const produto = await produtoServico.obterProdutoPorId(params.id);
    return responderSucesso(produto, "Produto detalhado carregado com sucesso.");
  } catch (erro) {
    return responderErro(erro);
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const sessao = await obterSessaoObrigatoriaApi(["prestador"]);
    const prestador = await prestadorServico.obterPrestadorPorUsuarioId(sessao.usuarioId);

    const { nome, descricao, preco, estoque, imagemUrl, ativo } = await request.json();

    if (!nome || preco === undefined || estoque === undefined) {
      throw new ErroAplicacao("Campos obrigatórios ausentes (nome, preco, estoque).", 400);
    }

    const produto = await produtoServico.atualizarProduto(params.id, prestador.id, {
      nome,
      descricao: descricao || "",
      preco: Number(preco),
      estoque: Number(estoque),
      imagemUrl,
      ativo
    });

    return responderSucesso(produto, "Produto atualizado com sucesso.");
  } catch (erro) {
    return responderErro(erro);
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    const sessao = await obterSessaoObrigatoriaApi(["prestador"]);
    const prestador = await prestadorServico.obterPrestadorPorUsuarioId(sessao.usuarioId);

    await produtoServico.excluirProduto(params.id, prestador.id);
    return responderSucesso(null, "Produto excluído com sucesso.");
  } catch (erro) {
    return responderErro(erro);
  }
}
