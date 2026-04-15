import { obterSessaoObrigatoriaApi } from "@/lib/autenticacao/sessao";
import { usuarioServico } from "@/lib/servicos/usuario-servico";
import { responderErro, responderSucesso } from "@/lib/utilitarios/respostas-api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const sessao = obterSessaoObrigatoriaApi(["CONTRATANTE"]);
    const perfil = await usuarioServico.obterPerfilContratante(sessao.usuarioId);
    return responderSucesso(perfil, "Perfil do contratante carregado com sucesso.");
  } catch (erro) {
    return responderErro(erro);
  }
}

export async function PATCH(request: Request) {
  try {
    const sessao = obterSessaoObrigatoriaApi(["CONTRATANTE"]);
    const corpoRequisicao = await request.json();
    const perfilAtualizado = await usuarioServico.atualizarPerfilUsuario(sessao.usuarioId, corpoRequisicao);
    return responderSucesso(perfilAtualizado, "Perfil atualizado com sucesso.");
  } catch (erro) {
    return responderErro(erro);
  }
}
