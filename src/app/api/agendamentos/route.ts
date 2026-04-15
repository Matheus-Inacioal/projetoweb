import { obterSessaoObrigatoriaApi } from "@/lib/autenticacao/sessao";
import { adminServico } from "@/lib/servicos/admin-servico";
import { agendamentoServico } from "@/lib/servicos/agendamento-servico";
import { responderErro, responderSucesso } from "@/lib/utilitarios/respostas-api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const sessao = obterSessaoObrigatoriaApi();

    if (sessao.perfil === "CONTRATANTE") {
      const listaAgendamentos = await agendamentoServico.listarAgendamentosDoContratante(sessao.usuarioId);
      return responderSucesso(listaAgendamentos, "Agendamentos carregados com sucesso.");
    }

    if (sessao.perfil === "PRESTADOR_PF") {
      const agenda = await agendamentoServico.listarAgendaDoProfissional(sessao.usuarioId);
      return responderSucesso(agenda, "Agenda profissional carregada com sucesso.");
    }

    if (sessao.perfil === "PRESTADOR_PJ") {
      const agenda = await agendamentoServico.listarAgendaDaBarbearia(sessao.usuarioId);
      return responderSucesso(agenda, "Agenda da barbearia carregada com sucesso.");
    }

    const listaAgendamentos = await adminServico.listarAgendamentos();
    return responderSucesso(listaAgendamentos, "Agendamentos administrativos carregados com sucesso.");
  } catch (erro) {
    return responderErro(erro);
  }
}

export async function POST(request: Request) {
  try {
    const sessao = obterSessaoObrigatoriaApi(["CONTRATANTE"]);
    const corpoRequisicao = await request.json();
    const agendamento = await agendamentoServico.criarAgendamento(sessao.usuarioId, corpoRequisicao);
    return responderSucesso(agendamento, "Agendamento criado com sucesso.", 201);
  } catch (erro) {
    return responderErro(erro);
  }
}
