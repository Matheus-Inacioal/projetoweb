import { obterSessaoObrigatoriaApi } from "@/lib/autenticacao/sessao";
import { agendamentoServico } from "@/services/agendamento-servico";
import { prestadorServico } from "@/services/prestador-servico";
import { responderErro, responderSucesso } from "@/lib/utilitarios/respostas-api";
import { ErroAplicacao } from "@/lib/utilitarios/erro-aplicacao";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const sessao = await obterSessaoObrigatoriaApi();

    if (sessao.tipoUsuario === "consumidor") {
      const agendamentos = await agendamentoServico.listarAgendamentosConsumidor(sessao.usuarioId);
      return responderSucesso(agendamentos, "Agendamentos carregados com sucesso.");
    } else if (sessao.tipoUsuario === "prestador") {
      const prestador = await prestadorServico.obterPrestadorPorUsuarioId(sessao.usuarioId);
      const agendamentos = await agendamentoServico.listarAgendamentosPrestador(prestador.id);
      return responderSucesso(agendamentos, "Agendamentos recebidos carregados com sucesso.");
    } else if (sessao.tipoUsuario === "admin") {
      return responderSucesso([], "Painel administrativo.");
    }

    throw new ErroAplicacao("Perfil de usuário inválido.", 400);
  } catch (erro) {
    return responderErro(erro);
  }
}

export async function POST(request: Request) {
  try {
    const sessao = await obterSessaoObrigatoriaApi(["consumidor"]);
    const { prestadorId, agendaId, servicoId, observacao } = await request.json();

    if (!prestadorId || !agendaId || !servicoId) {
      throw new ErroAplicacao("Campos obrigatórios ausentes.", 400);
    }

    const agendamento = await agendamentoServico.agendarServico(
      sessao.usuarioId,
      prestadorId,
      agendaId,
      servicoId,
      observacao
    );

    return responderSucesso(agendamento, "Serviço agendado com sucesso.", 201);
  } catch (erro) {
    return responderErro(erro);
  }
}
