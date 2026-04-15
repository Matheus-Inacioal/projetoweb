import { obterSessaoObrigatoriaApi } from "@/lib/autenticacao/sessao";
import { adminServico } from "@/lib/servicos/admin-servico";
import { responderErro, responderSucesso } from "@/lib/utilitarios/respostas-api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    obterSessaoObrigatoriaApi(["ADMIN"]);
    const resumo = await adminServico.obterResumoAdmin();
    return responderSucesso(resumo, "Resumo administrativo carregado com sucesso.");
  } catch (erro) {
    return responderErro(erro);
  }
}
