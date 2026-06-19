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

export async function PUT(request: Request, { params }: Params) {
  try {
    await obterSessaoObrigatoriaApi(["consumidor", "gestor_loja", "admin"]);
    const { status } = await request.json();

    const pedidoAtualizado = await pedidoServico.atualizarStatusPedido(params.id, status);
    return responderSucesso(pedidoAtualizado, `Status do pedido atualizado para '${status}' com sucesso.`);
  } catch (erro) {
    return responderErro(erro);
  }
}
