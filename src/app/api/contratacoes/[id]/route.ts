import { obterSessaoObrigatoriaApi } from "@/lib/autenticacao/sessao";
import { agendamentoServico } from "@/services/agendamento-servico";
import { responderErro, responderSucesso } from "@/lib/utilitarios/respostas-api";
import { ErroAplicacao } from "@/lib/utilitarios/erro-aplicacao";
import type { StatusAgendamento } from "@/tipos/enums";

export const dynamic = "force-dynamic";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const sessao = await obterSessaoObrigatoriaApi(["prestador", "consumidor"]);
    const body = await request.json();
    const { acao, status, observacao, novaAgendaId, aceito } = body;

    let agendamento;
    if (acao === "aprovar") {
      agendamento = await agendamentoServico.aprovarContratacao(params.id, sessao.usuarioId);
    } else if (acao === "recusar") {
      agendamento = await agendamentoServico.recusarContratacao(params.id, sessao.usuarioId, observacao);
    } else if (acao === "remarcar") {
      if (!novaAgendaId) {
        throw new ErroAplicacao("Horário de remarcação é obrigatório.", 400);
      }
      agendamento = await agendamentoServico.solicitarRemarcacao(params.id, sessao.usuarioId, novaAgendaId, observacao);
    } else if (acao === "responder_remarcacao") {
      if (aceito === undefined) {
        throw new ErroAplicacao("Resposta de aceitação/recusa é obrigatória.", 400);
      }
      agendamento = await agendamentoServico.responderRemarcacao(params.id, sessao.usuarioId, aceito);
    } else {
      if (!status) {
        throw new ErroAplicacao("Ação ou Status é obrigatório.", 400);
      }
      agendamento = await agendamentoServico.atualizarStatus(params.id, status as StatusAgendamento, sessao.usuarioId, observacao);
    }

    return responderSucesso(agendamento, `Ação de contratação processada com sucesso.`);
  } catch (erro) {
    return responderErro(erro);
  }
}
