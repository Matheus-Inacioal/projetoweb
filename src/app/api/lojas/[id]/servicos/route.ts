import { criarClienteSupabaseServidor } from "@/lib/banco/supabase-server";
import { responderErro, responderSucesso } from "@/lib/utilitarios/respostas-api";
import { ErroAplicacao } from "@/lib/utilitarios/erro-aplicacao";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = criarClienteSupabaseServidor();

    const { data: servicos, error } = await supabase
      .from("servicos")
      .select("*")
      .eq("loja_id", params.id)
      .eq("ativo", true)
      .order("nome");

    if (error) {
      throw new ErroAplicacao(error.message, 400);
    }

    return responderSucesso(servicos, "Serviços da loja carregados com sucesso.");
  } catch (erro) {
    return responderErro(erro);
  }
}
