import { obterSessaoObrigatoriaApi } from "@/lib/autenticacao/sessao";
import { produtoServico } from "@/services/produto-servico";
import { prestadorServico } from "@/services/prestador-servico";
import { responderErro, responderSucesso } from "@/lib/utilitarios/respostas-api";
import { ErroAplicacao } from "@/lib/utilitarios/erro-aplicacao";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const prestadorId = searchParams.get("prestadorId") || undefined;
    const apenasAtivos = searchParams.get("apenasAtivos") !== "false";

    const produtos = await produtoServico.listarProdutos({ prestadorId, apenasAtivos });
    return responderSucesso(produtos, "Produtos carregados com sucesso.");
  } catch (erro) {
    return responderErro(erro);
  }
}

export async function POST(request: Request) {
  try {
    const sessao = await obterSessaoObrigatoriaApi(["prestador"]);
    const prestador = await prestadorServico.obterPrestadorPorUsuarioId(sessao.usuarioId);

    const { nome, descricao, preco, estoque, imagemUrl } = await request.json();

    if (!nome || preco === undefined || estoque === undefined) {
      throw new ErroAplicacao("Campos obrigatórios ausentes (nome, preco, estoque).", 400);
    }

    const produto = await produtoServico.criarProduto(prestador.id, {
      nome,
      descricao: descricao || "",
      preco: Number(preco),
      estoque: Number(estoque),
      imagemUrl
    });

    return responderSucesso(produto, "Produto cadastrado com sucesso.", 201);
  } catch (erro) {
    return responderErro(erro);
  }
}
