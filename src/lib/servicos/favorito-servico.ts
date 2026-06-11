import { favoritoRepositorio } from "@/lib/repositorios/favorito-repositorio";
import { barbeariaRepositorio } from "@/lib/repositorios/barbearia-repositorio";
import { garantirCondicao, garantirExistencia } from "@/lib/utilitarios/erro-aplicacao";
import { mapearFavoritoResumo } from "@/lib/utilitarios/mapeadores";

export const favoritoServico = {
  async listarFavoritos(usuarioId: string) {
    const favoritos = await favoritoRepositorio.listarFavoritosPorUsuario(usuarioId);
    return favoritos.map(mapearFavoritoResumo);
  },

  async adicionarFavorito(usuarioId: string, barbeariaId: string) {
    garantirExistencia(
      await barbeariaRepositorio.obterBarbeariaPorId(barbeariaId),
      "Barbearia nao encontrada.",
      404
    );

    const favoritoExistente = await favoritoRepositorio.obterFavorito(usuarioId, barbeariaId);
    garantirCondicao(!favoritoExistente, "Esta barbearia ja esta nos seus favoritos.", 409);

    const favorito = await favoritoRepositorio.adicionarFavorito({
      usuario_id: usuarioId,
      barbearia_id: barbeariaId
    });

    return mapearFavoritoResumo(favorito);
  },

  async removerFavorito(usuarioId: string, barbeariaId: string) {
    await favoritoRepositorio.removerFavoritoPorUsuarioEBarbearia(usuarioId, barbeariaId);
  }
};
