import { obterSessaoObrigatoriaApi } from "@/lib/autenticacao/sessao";
import { produtoServico } from "@/services/produto-servico";
import { criarClienteSupabaseServidor } from "@/lib/banco/supabase-server";
import { responderErro, responderSucesso } from "@/lib/utilitarios/respostas-api";
import { ErroAplicacao } from "@/lib/utilitarios/erro-aplicacao";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const sessao = await obterSessaoObrigatoriaApi(["gestor_loja", "admin"]);
    const supabase = criarClienteSupabaseServidor();

    let lojaId = "";
    if (sessao.tipoUsuario === "gestor_loja") {
      const { data: gestor } = await supabase
        .from("gestores")
        .select("loja_id")
        .eq("usuario_id", sessao.usuarioId)
        .single();
      if (!gestor) throw new ErroAplicacao("Gestor não associado a uma loja.", 403);
      lojaId = gestor.loja_id;
    } else {
      const { searchParams } = new URL(request.url);
      lojaId = searchParams.get("lojaId") || "";
    }

    const produtos = await produtoServico.listarProdutos({ lojaId, apenasAtivos: false });
    return responderSucesso(produtos, "Produtos da loja carregados com sucesso.");
  } catch (erro) {
    return responderErro(erro);
  }
}

export async function POST(request: Request) {
  try {
    const sessao = await obterSessaoObrigatoriaApi(["gestor_loja", "admin"]);
    const supabase = criarClienteSupabaseServidor();

    let lojaId = "";
    if (sessao.tipoUsuario === "gestor_loja") {
      const { data: gestor } = await supabase
        .from("gestores")
        .select("loja_id")
        .eq("usuario_id", sessao.usuarioId)
        .single();
      if (!gestor) throw new ErroAplicacao("Gestor não associado a uma loja.", 403);
      lojaId = gestor.loja_id;
    } else {
      const { lojaId: bodyLojaId } = await request.clone().json();
      lojaId = bodyLojaId || "00000000-0000-0000-0000-000000000000";
    }

    const { nome, descricao, preco, estoque, estoqueMinimo, categoria, imagemUrl } = await request.json();

    if (!nome || preco === undefined || estoque === undefined || !categoria) {
      throw new ErroAplicacao("Nome, preço, estoque e categoria são obrigatórios.", 400);
    }

    const produto = await produtoServico.criarProduto(lojaId, {
      nome,
      descricao: descricao || "",
      preco: Number(preco),
      estoque: Number(estoque),
      estoqueMinimo: estoqueMinimo !== undefined ? Number(estoqueMinimo) : 0,
      categoria,
      imagemUrl
    });

    return responderSucesso(produto, "Produto cadastrado com sucesso.", 201);
  } catch (erro) {
    return responderErro(erro);
  }
}
