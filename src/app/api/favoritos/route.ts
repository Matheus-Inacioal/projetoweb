import { obterSessaoObrigatoriaApi } from "@/lib/autenticacao/sessao";
import { favoritoServico } from "@/lib/servicos/favorito-servico";
import { responderErro, responderSucesso } from "@/lib/utilitarios/respostas-api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const sessao = await obterSessaoObrigatoriaApi();
    const favoritos = await favoritoServico.listarFavoritos(sessao.usuarioId);
    return responderSucesso(favoritos, "Favoritos carregados com sucesso.");
  } catch (erro) {
    return responderErro(erro);
  }
}

export async function POST(request: Request) {
  try {
    const sessao = await obterSessaoObrigatoriaApi();
    const { barbeariaId } = await request.json();
    const favorito = await favoritoServico.adicionarFavorito(sessao.usuarioId, barbeariaId);
    return responderSucesso(favorito, "Barbearia adicionada aos favoritos.", 201);
  } catch (erro) {
    return responderErro(erro);
  }
}
