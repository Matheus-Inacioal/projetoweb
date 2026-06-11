import { prestadorServico } from "@/services/prestador-servico";
import { responderErro, responderSucesso } from "@/lib/utilitarios/respostas-api";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const prestador = await prestadorServico.obterPrestadorPorId(params.id);
    return responderSucesso(prestador, "Prestador detalhado com sucesso.");
  } catch (erro) {
    return responderErro(erro);
  }
}
