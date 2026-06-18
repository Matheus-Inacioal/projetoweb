import { obterSessaoObrigatoriaApi } from "@/lib/autenticacao/sessao";
import { pedidoServico } from "@/services/pedido-servico";
import { responderErro, responderSucesso } from "@/lib/utilitarios/respostas-api";

export const dynamic = "force-dynamic";

interface Params {
  params: {
    id: string;
  };
}

export async function GET(request: Request, { params }: Params) {
  try {
    const sessao = await obterSessaoObrigatoriaApi(["consumidor"]);
    const pedido = await pedidoServico.obterPedidoPorId(sessao.usuarioId, params.id);
    return responderSucesso(pedido, "Detalhes do pedido carregados com sucesso.");
  } catch (erro) {
    return responderErro(erro);
  }
}
