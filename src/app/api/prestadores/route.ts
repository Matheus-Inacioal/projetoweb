import { prestadorServico } from "@/services/prestador-servico";
import { responderErro, responderSucesso } from "@/lib/utilitarios/respostas-api";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cidade = searchParams.get("cidade") || undefined;
    const termo = searchParams.get("termo") || undefined;

    const prestadores = await prestadorServico.listarPrestadores({ cidade, termo });
    return responderSucesso(prestadores, "Prestadores carregados com sucesso.");
  } catch (erro) {
    return responderErro(erro);
  }
}
