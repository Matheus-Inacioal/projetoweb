import { obterSessaoObrigatoriaApi } from "@/lib/autenticacao/sessao";
import { barbeiroServico } from "@/lib/servicos/barbeiro-servico";
import { responderErro, responderSucesso } from "@/lib/utilitarios/respostas-api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const sessao = obterSessaoObrigatoriaApi(["PRESTADOR_PF"]);
    const perfil = await barbeiroServico.obterPerfilProfissional(sessao.usuarioId);
    return responderSucesso(perfil, "Perfil profissional carregado com sucesso.");
  } catch (erro) {
    return responderErro(erro);
  }
}

export async function POST(request: Request) {
  try {
    const sessao = obterSessaoObrigatoriaApi(["PRESTADOR_PF"]);
    const corpoRequisicao = await request.json();
    const perfilSalvo = await barbeiroServico.salvarPerfilProfissional(sessao.usuarioId, corpoRequisicao);
    return responderSucesso(perfilSalvo, "Perfil profissional salvo com sucesso.");
  } catch (erro) {
    return responderErro(erro);
  }
}
