import { obterSessaoObrigatoriaApi } from "@/lib/autenticacao/sessao";
import { agendaServico } from "@/services/agenda-servico";
import { prestadorServico } from "@/services/prestador-servico";
import { responderErro, responderSucesso } from "@/lib/utilitarios/respostas-api";
import { ErroAplicacao } from "@/lib/utilitarios/erro-aplicacao";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const prestadorId = searchParams.get("prestadorId");
    const data = searchParams.get("data") || undefined;

    if (!prestadorId) {
      throw new ErroAplicacao("prestadorId é obrigatório.", 400);
    }

    const slots = await agendaServico.listarAgendaPrestador(prestadorId, data);
    return responderSucesso(slots, "Agenda carregada com sucesso.");
  } catch (erro) {
    return responderErro(erro);
  }
}

export async function POST(request: Request) {
  try {
    const sessao = await obterSessaoObrigatoriaApi(["prestador"]);
    const prestador = await prestadorServico.obterPrestadorPorUsuarioId(sessao.usuarioId);

    const { data, horaInicio, horaFim } = await request.json();

    if (!data || !horaInicio || !horaFim) {
      throw new ErroAplicacao("Campos obrigatórios ausentes.", 400);
    }

    const slot = await agendaServico.criarHorario(prestador.id, data, horaInicio, horaFim);
    return responderSucesso(slot, "Horário adicionado com sucesso à agenda.", 201);
  } catch (erro) {
    return responderErro(erro);
  }
}
