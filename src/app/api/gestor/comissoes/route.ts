import { obterSessaoObrigatoriaApi } from "@/lib/autenticacao/sessao";
import { comissaoServico } from "@/services/comissao-servico";
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

    const comissoes = await comissaoServico.obterComissoesLoja(lojaId);
    return responderSucesso(comissoes, "Comissões da loja carregadas com sucesso.");
  } catch (erro) {
    return responderErro(erro);
  }
}
