import { obterSessaoObrigatoriaApi } from "@/lib/autenticacao/sessao";
import { criarClienteSupabaseServidor } from "@/lib/banco/supabase-server";
import { responderErro, responderSucesso } from "@/lib/utilitarios/respostas-api";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await obterSessaoObrigatoriaApi(["prestador", "consumidor", "admin"]);
    const supabase = criarClienteSupabaseServidor();

    const { data, error } = await supabase
      .from("historico_contratacoes")
      .select(`
        *,
        usuarios (
          nome
        )
      `)
      .eq("contratacao_id", params.id)
      .order("created_at", { ascending: true });

    if (error) {
      throw error;
    }

    const historico = data.map((h: any) => ({
      id: h.id,
      contratacaoId: h.contratacao_id,
      usuarioId: h.usuario_id,
      usuarioNome: h.usuarios?.nome ?? "Sistema",
      acao: h.acao,
      statusAnterior: h.status_anterior,
      statusNovo: h.status_novo,
      observacao: h.observacao,
      createdAt: h.created_at
    }));

    return responderSucesso(historico, "Histórico da contratação carregado com sucesso.");
  } catch (erro) {
    return responderErro(erro);
  }
}
