import { obterSessaoObrigatoriaApi } from "@/lib/autenticacao/sessao";
import { pedidoServico } from "@/services/pedido-servico";
import { responderErro, responderSucesso } from "@/lib/utilitarios/respostas-api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const sessao = await obterSessaoObrigatoriaApi(["consumidor"]);
    const pedidos = await pedidoServico.listarPedidosConsumidor(sessao.usuarioId);
    return responderSucesso(pedidos, "Histórico de pedidos carregado com sucesso.");
  } catch (erro) {
    return responderErro(erro);
  }
}

export async function POST() {
  try {
    const sessao = await obterSessaoObrigatoriaApi(["consumidor"]);
    const pedido = await pedidoServico.criarPedido(sessao.usuarioId);
    return responderSucesso(pedido, "Pedido realizado com sucesso.", 201);
  } catch (erro) {
    return responderErro(erro);
  }
}
