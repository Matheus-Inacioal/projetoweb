import { obterSessaoObrigatoriaApi } from "@/lib/autenticacao/sessao";
import { comissaoServico } from "@/services/comissao-servico";
import { responderErro, responderSucesso } from "@/lib/utilitarios/respostas-api";

export const dynamic = "force-dynamic";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await obterSessaoObrigatoriaApi(["gestor_loja", "admin"]);

    const comissaoPaga = await comissaoServico.pagarComissao(params.id);

    return responderSucesso(comissaoPaga, "Comissão marcada como paga com sucesso.");
  } catch (erro) {
    return responderErro(erro);
  }
}
