import { barbeiroServico } from "@/lib/servicos/barbeiro-servico";
import { responderErro, responderSucesso } from "@/lib/utilitarios/respostas-api";

export async function GET(_request: Request, { params }: { params: { barbeiroId: string } }) {
  try {
    const barbeiro = await barbeiroServico.obterBarbeiroPorId(params.barbeiroId);
    return responderSucesso(barbeiro, "Detalhes do barbeiro carregados com sucesso.");
  } catch (erro) {
    return responderErro(erro);
  }
}

