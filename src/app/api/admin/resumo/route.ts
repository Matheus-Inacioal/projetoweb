import { obterSessaoObrigatoriaApi } from "@/lib/autenticacao/sessao";
import { adminServico } from "@/services/admin-servico";
import { responderErro, responderSucesso } from "@/lib/utilitarios/respostas-api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Exige tipo "admin"
    await obterSessaoObrigatoriaApi(["admin"]);

    const resumo = await adminServico.obterResumoPainel();
    return responderSucesso(resumo, "Resumo do painel carregado com sucesso.");
  } catch (erro) {
    return responderErro(erro);
  }
}
