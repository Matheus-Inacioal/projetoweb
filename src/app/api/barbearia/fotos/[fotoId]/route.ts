import { obterSessaoObrigatoriaApi } from "@/lib/autenticacao/sessao";
import { fotoServico } from "@/lib/servicos/foto-servico";
import { responderErro, responderSucesso } from "@/lib/utilitarios/respostas-api";

export const dynamic = "force-dynamic";

export async function DELETE(_request: Request, { params }: { params: { fotoId: string } }) {
  try {
    await obterSessaoObrigatoriaApi(["PRESTADOR_PJ", "ADMIN"]);
    await fotoServico.removerFoto(params.fotoId);
    return responderSucesso(null, "Foto removida com sucesso.");
  } catch (erro) {
    return responderErro(erro);
  }
}
