import { prestadorServico } from "@/services/prestador-servico";
import { responderErro, responderSucesso } from "@/lib/utilitarios/respostas-api";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const prestadores = await prestadorServico.listarPrestadores({ lojaId: params.id });
    return responderSucesso(prestadores, "Prestadores da loja carregados com sucesso.");
  } catch (erro) {
    return responderErro(erro);
  }
}
