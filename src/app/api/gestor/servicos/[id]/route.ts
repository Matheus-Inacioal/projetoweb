import { obterSessaoObrigatoriaApi } from "@/lib/autenticacao/sessao";
import { criarClienteSupabaseServidor } from "@/lib/banco/supabase-server";
import { responderErro, responderSucesso } from "@/lib/utilitarios/respostas-api";
import { ErroAplicacao } from "@/lib/utilitarios/erro-aplicacao";

export const dynamic = "force-dynamic";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await obterSessaoObrigatoriaApi(["gestor_loja", "admin"]);
    const supabase = criarClienteSupabaseServidor();

    const { nome, descricao, preco, duracaoMinutos, ativo } = await request.json();

    const { data, error } = await supabase
      .from("servicos")
      .update({
        nome,
        descricao: descricao || "",
        preco: Number(preco),
        duracao_minutos: Number(duracaoMinutos),
        ativo: ativo ?? true
      })
      .eq("id", params.id)
      .select()
      .single();

    if (error) throw new ErroAplicacao(error.message, 400);

    return responderSucesso(data, "Serviço atualizado com sucesso.");
  } catch (erro) {
    return responderErro(erro);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await obterSessaoObrigatoriaApi(["gestor_loja", "admin"]);
    const supabase = criarClienteSupabaseServidor();

    const { error } = await supabase
      .from("servicos")
      .delete()
      .eq("id", params.id);

    if (error) throw new ErroAplicacao(error.message, 400);

    return responderSucesso(null, "Serviço excluído com sucesso.");
  } catch (erro) {
    return responderErro(erro);
  }
}
