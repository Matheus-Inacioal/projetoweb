import { obterSessaoObrigatoriaApi } from "@/lib/autenticacao/sessao";
import { favoritoServico } from "@/services/favorito-servico";
import { responderErro, responderSucesso } from "@/lib/utilitarios/respostas-api";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: { prestadorId: string } }) {
  try {
    const sessao = await obterSessaoObrigatoriaApi(["consumidor"]);
    const eFavorito = await favoritoServico.eFavorito(sessao.usuarioId, params.prestadorId);
    return responderSucesso({ eFavorito }, "Status de favorito carregado com sucesso.");
  } catch (erro) {
    return responderErro(erro);
  }
}

export async function DELETE(request: Request, { params }: { params: { prestadorId: string } }) {
  try {
    const sessao = await obterSessaoObrigatoriaApi(["consumidor"]);
    await favoritoServico.removerFavorito(sessao.usuarioId, params.prestadorId);
    return responderSucesso(null, "Prestador removido dos favoritos com sucesso.");
  } catch (erro) {
    return responderErro(erro);
  }
}
