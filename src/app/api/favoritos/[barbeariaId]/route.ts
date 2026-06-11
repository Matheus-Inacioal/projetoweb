import { obterSessaoObrigatoriaApi } from "@/lib/autenticacao/sessao";
import { favoritoServico } from "@/lib/servicos/favorito-servico";
import { responderErro, responderSucesso } from "@/lib/utilitarios/respostas-api";

export const dynamic = "force-dynamic";

export async function DELETE(_request: Request, { params }: { params: { barbeariaId: string } }) {
  try {
    const sessao = await obterSessaoObrigatoriaApi();
    await favoritoServico.removerFavorito(sessao.usuarioId, params.barbeariaId);
    return responderSucesso(null, "Barbearia removida dos favoritos.");
  } catch (erro) {
    return responderErro(erro);
  }
}
