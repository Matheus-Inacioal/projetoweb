import { barbeariaServico } from "@/lib/servicos/barbearia-servico";
import { responderErro, responderSucesso } from "@/lib/utilitarios/respostas-api";

export async function GET() {
  try {
    const listaBarbearias = await barbeariaServico.listarBarbearias();
    return responderSucesso(listaBarbearias, "Barbearias carregadas com sucesso.");
  } catch (erro) {
    return responderErro(erro);
  }
}

