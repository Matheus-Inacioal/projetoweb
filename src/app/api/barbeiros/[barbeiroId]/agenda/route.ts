import { obterSessaoObrigatoriaApi } from "@/lib/autenticacao/sessao";
import { agendamentoServico } from "@/lib/servicos/agendamento-servico";
import { barbeariaServico } from "@/lib/servicos/barbearia-servico";
import { barbeiroServico } from "@/lib/servicos/barbeiro-servico";
import { ErroAplicacao } from "@/lib/utilitarios/erro-aplicacao";
import { responderErro, responderSucesso } from "@/lib/utilitarios/respostas-api";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: { barbeiroId: string } }) {
  try {
    const sessao = obterSessaoObrigatoriaApi(["PRESTADOR_PF", "PRESTADOR_PJ", "ADMIN"]);

    if (sessao.perfil === "PRESTADOR_PF") {
      const perfilProfissional = await barbeiroServico.obterBarbeiroPorUsuarioId(sessao.usuarioId);

      if (!perfilProfissional || perfilProfissional.barbeiro.id !== params.barbeiroId) {
        throw new ErroAplicacao("Voce nao pode visualizar esta agenda.", 403);
      }
    }

    if (sessao.perfil === "PRESTADOR_PJ") {
      const [perfilBarbearia, barbeiro] = await Promise.all([
        barbeariaServico.obterPerfilBarbearia(sessao.usuarioId),
        barbeiroServico.obterBarbeiroPorId(params.barbeiroId)
      ]);

      if (!perfilBarbearia.barbearia || perfilBarbearia.barbearia.id !== barbeiro.barbeiro.barbeariaId) {
        throw new ErroAplicacao("Voce nao pode visualizar esta agenda.", 403);
      }
    }

    const agenda = await agendamentoServico.listarAgendaPorBarbeiroId(params.barbeiroId);
    return responderSucesso(agenda, "Agenda do barbeiro carregada com sucesso.");
  } catch (erro) {
    return responderErro(erro);
  }
}
