import { obterSessaoObrigatoriaApi } from "@/lib/autenticacao/sessao";
import { anuncioServico } from "@/services/anuncio-servico";
import { prestadorServico } from "@/services/prestador-servico";
import { responderErro, responderSucesso } from "@/lib/utilitarios/respostas-api";

export const dynamic = "force-dynamic";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const sessao = await obterSessaoObrigatoriaApi(["prestador"]);
    const prestador = await prestadorServico.obterPrestadorPorUsuarioId(sessao.usuarioId);

    const corpo = await request.json();
    const anuncio = await anuncioServico.atualizarAnuncio(params.id, prestador.id, {
      titulo: corpo.titulo,
      descricao: corpo.descricao,
      imagemUrl: corpo.imagemUrl,
      ativo: corpo.ativo
    });

    return responderSucesso(anuncio, "Anúncio atualizado com sucesso.");
  } catch (erro) {
    return responderErro(erro);
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const sessao = await obterSessaoObrigatoriaApi(["prestador"]);
    const prestador = await prestadorServico.obterPrestadorPorUsuarioId(sessao.usuarioId);

    await anuncioServico.excluirAnuncio(params.id, prestador.id);
    return responderSucesso(null, "Anúncio excluído com sucesso.");
  } catch (erro) {
    return responderErro(erro);
  }
}
