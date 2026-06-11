import { obterSessaoObrigatoriaApi } from "@/lib/autenticacao/sessao";
import { contratacaoServico } from "@/services/contratacao-servico";
import { prestadorServico } from "@/services/prestador-servico";
import { responderErro, responderSucesso } from "@/lib/utilitarios/respostas-api";
import { ErroAplicacao } from "@/lib/utilitarios/erro-aplicacao";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const sessao = await obterSessaoObrigatoriaApi();

    if (sessao.tipo === "consumidor") {
      const contratacoes = await contratacaoServico.listarContratacoesConsumidor(sessao.usuarioId);
      return responderSucesso(contratacoes, "Contratações carregadas com sucesso.");
    } else if (sessao.tipo === "prestador") {
      const prestador = await prestadorServico.obterPrestadorPorUsuarioId(sessao.usuarioId);
      const contratacoes = await contratacaoServico.listarContratacoesPrestador(prestador.id);
      return responderSucesso(contratacoes, "Contratações recebidas carregadas com sucesso.");
    } else if (sessao.tipo === "admin") {
      // Admin lists all (or we could return a message/empty list, but let's handle admin load or return empty)
      return responderSucesso([], "Admin no list direct.");
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

    const contratacao = await contratacaoServico.contratarServico(
      sessao.usuarioId,
      prestadorId,
      agendaId,
      servicoId,
      observacao
    );

    return responderSucesso(contratacao, "Serviço contratado com sucesso.", 201);
  } catch (erro) {
    return responderErro(erro);
  }
}
