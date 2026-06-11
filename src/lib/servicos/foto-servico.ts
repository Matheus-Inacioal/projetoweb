import { criarClienteSupabaseServidor } from "@/lib/banco/supabase-server";
import { barbeariaRepositorio } from "@/lib/repositorios/barbearia-repositorio";
import { fotoRepositorio } from "@/lib/repositorios/foto-repositorio";
import { garantirExistencia } from "@/lib/utilitarios/erro-aplicacao";
import { mapearFotoResumo } from "@/lib/utilitarios/mapeadores";

export const fotoServico = {
  async listarFotosPorBarbearia(barbeariaId: string) {
    const fotos = await fotoRepositorio.listarFotosPorBarbearia(barbeariaId);
    return fotos.map(mapearFotoResumo);
  },

  async uploadFoto(barbeariaId: string, arquivo: File, descricao?: string) {
    garantirExistencia(
      await barbeariaRepositorio.obterBarbeariaPorId(barbeariaId),
      "Barbearia nao encontrada.",
      404
    );

    const supabase = criarClienteSupabaseServidor();

    // Gerar nome único para o arquivo
    const extensao = arquivo.name.split(".").pop() ?? "jpg";
    const nomeArquivo = `${barbeariaId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${extensao}`;

    // Upload para Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("fotos")
      .upload(nomeArquivo, arquivo, {
        contentType: arquivo.type,
        upsert: false
      });

    if (uploadError) {
      throw new Error(`Erro ao fazer upload: ${uploadError.message}`);
    }

    // Obter URL pública
    const { data: urlData } = supabase.storage
      .from("fotos")
      .getPublicUrl(nomeArquivo);

    // Salvar registro no banco
    const foto = await fotoRepositorio.criarFoto({
      barbearia_id: barbeariaId,
      url: urlData.publicUrl,
      descricao: descricao ?? null
    });

    return mapearFotoResumo(foto);
  },

  async removerFoto(fotoId: string) {
    const foto = await fotoRepositorio.removerFoto(fotoId);

    if (foto) {
      // Extrair caminho do arquivo da URL para deletar do Storage
      const url = new URL(foto.url);
      const caminhoStorage = url.pathname.split("/storage/v1/object/public/fotos/")[1];

      if (caminhoStorage) {
        const supabase = criarClienteSupabaseServidor();
        await supabase.storage.from("fotos").remove([caminhoStorage]);
      }
    }
  }
};
