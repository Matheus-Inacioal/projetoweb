import { obterSessaoObrigatoriaApi } from "@/lib/autenticacao/sessao";
import { anuncioServico } from "@/services/anuncio-servico";
import { prestadorServico } from "@/services/prestador-servico";
import { responderErro, responderSucesso } from "@/lib/utilitarios/respostas-api";
import { ErroAplicacao } from "@/lib/utilitarios/erro-aplicacao";

import { obterSessaoAtual } from "@/lib/autenticacao/sessao";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const prestadorId = searchParams.get("prestadorId") || undefined;
    const apenasAtivosParam = searchParams.get("apenasAtivos");
    
    let apenasAtivos = apenasAtivosParam !== "false";
    let queryPrestadorId = prestadorId;

    const sessao = await obterSessaoAtual();
    if (sessao && sessao.tipo === "prestador" && !prestadorId) {
      const prestador = await prestadorServico.obterPrestadorPorUsuarioId(sessao.usuarioId);
      queryPrestadorId = prestador.id;
      apenasAtivos = false; // Prestador visualiza anúncios ativos e inativos dele
    }

    const anuncios = await anuncioServico.listarAnuncios({
      prestadorId: queryPrestadorId,
      apenasAtivos
    });
    return responderSucesso(anuncios, "Anúncios carregados com sucesso.");
  } catch (erro) {
    return responderErro(erro);
  }
}

export async function POST(request: Request) {
  try {
    const sessao = await obterSessaoObrigatoriaApi(["prestador"]);
    const prestador = await prestadorServico.obterPrestadorPorUsuarioId(sessao.usuarioId);

    const { titulo, descricao, imagemUrl } = await request.json();

    if (!titulo || !descricao) {
      throw new ErroAplicacao("Título e descrição são obrigatórios.", 400);
    }

    const anuncio = await anuncioServico.criarAnuncio(prestador.id, {
      titulo,
      descricao,
      imagemUrl
    });

    return responderSucesso(anuncio, "Anúncio criado com sucesso.", 201);
  } catch (erro) {
    return responderErro(erro);
  }
}
