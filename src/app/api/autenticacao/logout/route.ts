import { criarClienteSupabaseServidor } from "@/lib/banco/supabase-server";
import { responderErro, responderSucesso } from "@/lib/utilitarios/respostas-api";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const supabase = criarClienteSupabaseServidor();
    await supabase.auth.signOut();
    return responderSucesso(null, "Sessao encerrada com sucesso.");
  } catch (erro) {
    return responderErro(erro);
  }
}
