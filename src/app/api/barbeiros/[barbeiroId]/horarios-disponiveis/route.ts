import { agendamentoServico } from "@/lib/servicos/agendamento-servico";
import { responderErro, responderSucesso } from "@/lib/utilitarios/respostas-api";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: { barbeiroId: string } }) {
  try {
    const url = new URL(request.url);
    const data = url.searchParams.get("data") ?? "";
    const servicoId = url.searchParams.get("servicoId") ?? "";

    const horariosDisponiveis = await agendamentoServico.obterHorariosDisponiveis({
      barbeiroId: params.barbeiroId,
      data,
      servicoId
    });

    return responderSucesso(horariosDisponiveis, "Horarios disponiveis carregados com sucesso.");
  } catch (erro) {
    return responderErro(erro);
  }
}

