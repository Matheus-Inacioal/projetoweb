import { obterSessaoObrigatoriaApi } from "@/lib/autenticacao/sessao";
import { agendaServico } from "@/services/agenda-servico";
import { prestadorServico } from "@/services/prestador-servico";
import { responderErro, responderSucesso } from "@/lib/utilitarios/respostas-api";

export const dynamic = "force-dynamic";

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const sessao = await obterSessaoObrigatoriaApi(["prestador"]);
    const prestador = await prestadorServico.obterPrestadorPorUsuarioId(sessao.usuarioId);

    await agendaServico.excluirHorario(params.id, prestador.id);
    return responderSucesso(null, "Horário excluído da agenda com sucesso.");
  } catch (erro) {
    return responderErro(erro);
  }
}
