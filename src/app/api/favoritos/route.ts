import { obterSessaoObrigatoriaApi } from "@/lib/autenticacao/sessao";
import { favoritoServico } from "@/services/favorito-servico";
import { responderErro, responderSucesso } from "@/lib/utilitarios/respostas-api";
import { ErroAplicacao } from "@/lib/utilitarios/erro-aplicacao";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const sessao = await obterSessaoObrigatoriaApi(["consumidor"]);
    const favoritos = await favoritoServico.listarFavoritos(sessao.usuarioId);
    return responderSucesso(favoritos, "Favoritos carregados com sucesso.");
  } catch (erro) {
    return responderErro(erro);
  }
}

export async function POST(request: Request) {
  try {
    const sessao = await obterSessaoObrigatoriaApi(["consumidor"]);
    const { prestadorId } = await request.json();

    if (!prestadorId) {
      throw new ErroAplicacao("prestadorId é obrigatório.", 400);
    }

    const favorito = await favoritoServico.adicionarFavorito(sessao.usuarioId, prestadorId);
    return responderSucesso(favorito, "Prestador adicionado aos favoritos com sucesso.", 201);
  } catch (erro) {
    return responderErro(erro);
  }
}
