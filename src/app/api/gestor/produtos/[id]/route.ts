import { obterSessaoObrigatoriaApi } from "@/lib/autenticacao/sessao";
import { produtoServico } from "@/services/produto-servico";
import { criarClienteSupabaseServidor } from "@/lib/banco/supabase-server";
import { responderErro, responderSucesso } from "@/lib/utilitarios/respostas-api";
import { ErroAplicacao } from "@/lib/utilitarios/erro-aplicacao";

export const dynamic = "force-dynamic";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    const { nome, descricao, preco, estoque, estoqueMinimo, categoria, imagemUrl, ativo } = await request.json();

    const produto = await produtoServico.atualizarProduto(params.id, lojaId, {
      nome,
      descricao: descricao || "",
      preco: Number(preco),
      estoque: Number(estoque),
      estoqueMinimo: estoqueMinimo !== undefined ? Number(estoqueMinimo) : 0,
      categoria,
      imagemUrl,
      ativo
    });

    return responderSucesso(produto, "Produto atualizado com sucesso.");
  } catch (erro) {
    return responderErro(erro);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
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
      lojaId = searchParams.get("lojaId") || "00000000-0000-0000-0000-000000000000";
    }

    await produtoServico.excluirProduto(params.id, lojaId);

    return responderSucesso(null, "Produto excluído com sucesso.");
  } catch (erro) {
    return responderErro(erro);
  }
}
