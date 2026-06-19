import { obterSessaoObrigatoriaApi } from "@/lib/autenticacao/sessao";
import { produtoServico } from "@/services/produto-servico";
import { prestadorServico } from "@/services/prestador-servico";
import { responderErro, responderSucesso } from "@/lib/utilitarios/respostas-api";
import { ErroAplicacao } from "@/lib/utilitarios/erro-aplicacao";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lojaId = searchParams.get("lojaId") || undefined;
    const prestadorId = searchParams.get("prestadorId") || undefined;
    const apenasAtivos = searchParams.get("apenasAtivos") !== "false";

    let queryLojaId = lojaId;
    if (prestadorId && !queryLojaId) {
      try {
        const prestador = await prestadorServico.obterPrestadorPorUsuarioId(prestadorId);
        queryLojaId = prestador.loja_id;
      } catch (e) {
        // Ignora falha de resolução e prossegue
      }
    }

    const produtos = await produtoServico.listarProdutos({ lojaId: queryLojaId, apenasAtivos });
    return responderSucesso(produtos, "Produtos carregados com sucesso.");
  } catch (erro) {
    return responderErro(erro);
  }
}

export async function POST(request: Request) {
  try {
    const sessao = await obterSessaoObrigatoriaApi(["prestador"]);
    const prestador = await prestadorServico.obterPrestadorPorUsuarioId(sessao.usuarioId);

    const { nome, descricao, preco, estoque, categoria, estoqueMinimo, imagemUrl } = await request.json();

    if (!nome || preco === undefined || estoque === undefined) {
      throw new ErroAplicacao("Campos obrigatórios ausentes (nome, preco, estoque).", 400);
    }

    const produto = await produtoServico.criarProduto(prestador.loja_id || "00000000-0000-0000-0000-000000000000", {
      nome,
      descricao: descricao || "",
      preco: Number(preco),
      estoque: Number(estoque),
      categoria: categoria || "Geral",
      estoqueMinimo: estoqueMinimo !== undefined ? Number(estoqueMinimo) : 0,
      imagemUrl
    });

    return responderSucesso(produto, "Produto cadastrado com sucesso.", 201);
  } catch (erro) {
    return responderErro(erro);
  }
}
