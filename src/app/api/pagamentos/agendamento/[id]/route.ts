import { obterSessaoObrigatoriaApi } from "@/lib/autenticacao/sessao";
import { pagamentoServico } from "@/services/pagamento-servico";
import { responderErro, responderSucesso } from "@/lib/utilitarios/respostas-api";

export const dynamic = "force-dynamic";

interface Params {
  params: {
    id: string;
  };
}

export async function POST(request: Request, { params }: Params) {
  try {
    // Apenas o consumidor associado (ou admin) pode criar o pagamento do agendamento
    await obterSessaoObrigatoriaApi(["consumidor", "admin"]);

    const pagamento = await pagamentoServico.criarPagamentoContratacao(params.id);
    return responderSucesso(pagamento, "Pagamento do agendamento gerado com sucesso.");
  } catch (erro) {
    return responderErro(erro);
  }
}
