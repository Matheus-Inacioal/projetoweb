import { criarClienteSupabaseServidor } from "@/lib/banco/supabase-server";
import { ErroAplicacao } from "@/lib/utilitarios/erro-aplicacao";

export const anuncioServico = {
  async listarAnuncios(filtros?: { prestadorId?: string; apenasAtivos?: boolean }) {
    const supabase = criarClienteSupabaseServidor();

    let query = supabase
      .from("anuncios")
      .select(`
        *,
        prestadores (
          id,
          foto_url,
          usuarios (
            nome
          )
        )
      `)
      .order("criado_em", { ascending: false });

    if (filtros?.prestadorId) {
      query = query.eq("prestador_id", filtros.prestadorId);
    }

    if (filtros?.apenasAtivos) {
      query = query.eq("ativo", true);
    }

    const { data, error } = await query;

    if (error) {
      throw new ErroAplicacao(error.message, 400);
    }

    return data.map((a: any) => ({
      id: a.id,
      prestadorId: a.prestador_id,
      prestadorNome: a.prestadores?.usuarios?.nome ?? "Prestador",
      prestadorFotoUrl: a.prestadores?.foto_url ?? null,
      titulo: a.titulo,
      descricao: a.descricao,
      imagemUrl: a.imagem_url,
      ativo: a.ativo,
      criadoEm: a.criado_em
    }));
  },

  async criarAnuncio(prestadorId: string, dados: { titulo: string; descricao: string; imagemUrl?: string | null }) {
    const supabase = criarClienteSupabaseServidor();

    const { data, error } = await supabase
      .from("anuncios")
      .insert({
        prestador_id: prestadorId,
        titulo: dados.titulo,
        descricao: dados.descricao,
        imagem_url: dados.imagemUrl ?? null,
        ativo: true
      })
      .select()
      .single();

    if (error) {
      throw new ErroAplicacao(error.message, 400);
    }

    return data;
  },

  async atualizarAnuncio(
    anuncioId: string,
    prestadorId: string,
    dados: { titulo: string; descricao: string; imagemUrl?: string | null; ativo?: boolean }
  ) {
    const supabase = criarClienteSupabaseServidor();

    const updates: any = {
      titulo: dados.titulo,
      descricao: dados.descricao,
      ativo: dados.ativo ?? true
    };

    if (dados.imagemUrl !== undefined) {
      updates.imagem_url = dados.imagemUrl;
    }

    const { data, error } = await supabase
      .from("anuncios")
      .update(updates)
      .eq("id", anuncioId)
      .eq("prestador_id", prestadorId)
      .select()
      .single();

    if (error) {
      throw new ErroAplicacao(error.message, 400);
    }

    return data;
  },

  async excluirAnuncio(anuncioId: string, prestadorId: string) {
    const supabase = criarClienteSupabaseServidor();

    const { error } = await supabase
      .from("anuncios")
      .delete()
      .eq("id", anuncioId)
      .eq("prestador_id", prestadorId);

    if (error) {
      throw new ErroAplicacao(error.message, 400);
    }

    return true;
  },

  async fazerUploadImagem(prestadorId: string, arquivo: Buffer, nomeArquivo: string, mimeType: string) {
    const supabase = criarClienteSupabaseServidor();

    const extensao = nomeArquivo.split(".").pop();
    const caminhoArquivo = `anuncios/${prestadorId}/${Date.now()}.${extensao}`;

    const { error: uploadError } = await supabase.storage
      .from("perfis")
      .upload(caminhoArquivo, arquivo, {
        contentType: mimeType,
        upsert: true
      });

    if (uploadError) {
      throw new ErroAplicacao("Erro no upload do anúncio: " + uploadError.message, 400);
    }

    const { data } = supabase.storage
      .from("perfis")
      .getPublicUrl(caminhoArquivo);

    return data.publicUrl;
  }
};
