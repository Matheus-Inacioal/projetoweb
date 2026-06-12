import { obterSessaoObrigatoriaApi } from "@/lib/autenticacao/sessao";
import { agendamentoServico } from "@/services/agendamento-servico";
import { responderErro, responderSucesso } from "@/lib/utilitarios/respostas-api";
import { ErroAplicacao } from "@/lib/utilitarios/erro-aplicacao";
import type { StatusAgendamento } from "@/tipos/enums";

export const dynamic = "force-dynamic";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    await obterSessaoObrigatoriaApi(["prestador", "consumidor"]);
    const { status } = await request.json();

    if (!status) {
      throw new ErroAplicacao("Status é obrigatório.", 400);
    }

    const agendamento = await agendamentoServico.atualizarStatus(params.id, status as StatusAgendamento);
    return responderSucesso(agendamento, `Status do agendamento atualizado para ${status} com sucesso.`);
  } catch (erro) {
    return responderErro(erro);
  }
}
