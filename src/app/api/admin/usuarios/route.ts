import { obterSessaoObrigatoriaApi } from "@/lib/autenticacao/sessao";
import { adminServico } from "@/lib/servicos/admin-servico";
import { responderErro, responderSucesso } from "@/lib/utilitarios/respostas-api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    obterSessaoObrigatoriaApi(["ADMIN"]);
    const usuarios = await adminServico.listarUsuarios();
    return responderSucesso(usuarios, "Usuarios carregados com sucesso.");
  } catch (erro) {
    return responderErro(erro);
  }
}
