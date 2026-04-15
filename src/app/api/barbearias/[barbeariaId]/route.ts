import { barbeariaServico } from "@/lib/servicos/barbearia-servico";
import { responderErro, responderSucesso } from "@/lib/utilitarios/respostas-api";

export async function GET(_request: Request, { params }: { params: { barbeariaId: string } }) {
  try {
    const barbearia = await barbeariaServico.obterBarbeariaPorId(params.barbeariaId);
    return responderSucesso(barbearia, "Detalhes da barbearia carregados com sucesso.");
  } catch (erro) {
    return responderErro(erro);
  }
}

