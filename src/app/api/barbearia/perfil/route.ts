import { obterSessaoObrigatoriaApi } from "@/lib/autenticacao/sessao";
import { barbeariaServico } from "@/lib/servicos/barbearia-servico";
import { responderErro, responderSucesso } from "@/lib/utilitarios/respostas-api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const sessao = obterSessaoObrigatoriaApi(["PRESTADOR_PJ"]);
    const perfil = await barbeariaServico.obterPerfilBarbearia(sessao.usuarioId);
    return responderSucesso(perfil, "Perfil da barbearia carregado com sucesso.");
  } catch (erro) {
    return responderErro(erro);
  }
}

export async function POST(request: Request) {
  try {
    const sessao = obterSessaoObrigatoriaApi(["PRESTADOR_PJ"]);
    const corpoRequisicao = await request.json();
    const perfilSalvo = await barbeariaServico.salvarPerfilBarbearia(sessao.usuarioId, corpoRequisicao);
    return responderSucesso(perfilSalvo, "Perfil da barbearia salvo com sucesso.");
  } catch (erro) {
    return responderErro(erro);
  }
}
