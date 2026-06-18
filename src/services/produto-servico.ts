import { criarClienteSupabaseServidor } from "@/lib/banco/supabase-server";
import { ErroAplicacao } from "@/lib/utilitarios/erro-aplicacao";

export const produtoServico = {
  async listarProdutos(filtros?: { prestadorId?: string; apenasAtivos?: boolean }) {
    const supabase = criarClienteSupabaseServidor();

    let query = supabase
      .from("produtos")
      .select(`
        *,
        prestadores (
          id,
          usuarios (
            nome
          )
        )
      `)
      .order("created_at", { ascending: false });

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

    return data.map((p: any) => ({
      id: p.id,
      prestadorId: p.prestador_id,
      prestadorNome: p.prestadores?.usuarios?.nome ?? "Barbearia",
      nome: p.nome,
      descricao: p.descricao,
      preco: Number(p.preco),
      estoque: p.estoque,
      imagemUrl: p.imagem_url,
      ativo: p.ativo,
      createdAt: p.created_at
    }));
  },

  async obterProdutoPorId(id: string) {
    const supabase = criarClienteSupabaseServidor();

    const { data: p, error } = await supabase
      .from("produtos")
      .select(`
        *,
        prestadores (
          id,
          usuarios (
            nome
          )
        )
      `)
      .eq("id", id)
      .single();

    if (error || !p) {
      throw new ErroAplicacao("Produto não encontrado.", 404);
    }

    return {
      id: p.id,
      prestadorId: p.prestador_id,
      prestadorNome: p.prestadores?.usuarios?.nome ?? "Barbearia",
      nome: p.nome,
      descricao: p.descricao,
      preco: Number(p.preco),
      estoque: p.estoque,
      imagemUrl: p.imagem_url,
      ativo: p.ativo,
      createdAt: p.created_at
    };
  },

  async criarProduto(
    prestadorId: string,
    dados: { nome: string; descricao: string; preco: number; estoque: number; imagemUrl?: string | null }
  ) {
    const supabase = criarClienteSupabaseServidor();

    const { data, error } = await supabase
      .from("produtos")
      .insert({
        prestador_id: prestadorId,
        nome: dados.nome,
        descricao: dados.descricao,
        preco: dados.preco,
        estoque: dados.estoque,
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

  async atualizarProduto(
    produtoId: string,
    prestadorId: string,
    dados: { nome: string; descricao: string; preco: number; estoque: number; imagemUrl?: string | null; ativo?: boolean }
  ) {
    const supabase = criarClienteSupabaseServidor();

    const { data, error } = await supabase
      .from("produtos")
      .update({
        nome: dados.nome,
        descricao: dados.descricao,
        preco: dados.preco,
        estoque: dados.estoque,
        imagem_url: dados.imagemUrl,
        ativo: dados.ativo ?? true
      })
      .eq("id", produtoId)
      .eq("prestador_id", prestadorId)
      .select()
      .single();

    if (error) {
      throw new ErroAplicacao(error.message, 400);
    }

    return data;
  },

  async excluirProduto(produtoId: string, prestadorId: string) {
    const supabase = criarClienteSupabaseServidor();

    const { error } = await supabase
      .from("produtos")
      .delete()
      .eq("id", produtoId)
      .eq("prestador_id", prestadorId);

    if (error) {
      throw new ErroAplicacao(error.message, 400);
    }

    return true;
  },

  async fazerUploadImagem(prestadorId: string, arquivo: Buffer, nomeArquivo: string, mimeType: string) {
    const supabase = criarClienteSupabaseServidor();

    const extensao = nomeArquivo.split(".").pop();
    const caminhoArquivo = `${prestadorId}/${Date.now()}.${extensao}`;

    const { error: uploadError } = await supabase.storage
      .from("produtos")
      .upload(caminhoArquivo, arquivo, {
        contentType: mimeType,
        upsert: true
      });

    if (uploadError) {
      throw new ErroAplicacao("Erro no upload do produto: " + uploadError.message, 400);
    }

    const { data } = supabase.storage
      .from("produtos")
      .getPublicUrl(caminhoArquivo);

    return data.publicUrl;
  }
};
