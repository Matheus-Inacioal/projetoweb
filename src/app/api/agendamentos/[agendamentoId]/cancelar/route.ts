import { obterSessaoObrigatoriaApi } from "@/lib/autenticacao/sessao";
import { agendamentoServico } from "@/lib/servicos/agendamento-servico";
import { responderErro, responderSucesso } from "@/lib/utilitarios/respostas-api";

export const dynamic = "force-dynamic";

export async function PATCH(_request: Request, { params }: { params: { agendamentoId: string } }) {
  try {
    const sessao = obterSessaoObrigatoriaApi();
    const agendamento = await agendamentoServico.cancelarAgendamento(
      params.agendamentoId,
      sessao.usuarioId,
      sessao.perfil
    );

    return responderSucesso(agendamento, "Agendamento cancelado com sucesso.");
  } catch (erro) {
    return responderErro(erro);
  }
}
