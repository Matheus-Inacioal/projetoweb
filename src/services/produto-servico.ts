import { criarClienteSupabaseServidor } from "@/lib/banco/supabase-server";
import { ErroAplicacao } from "@/lib/utilitarios/erro-aplicacao";

export const produtoServico = {
  async listarProdutos(filtros?: { lojaId?: string; apenasAtivos?: boolean }) {
    const supabase = criarClienteSupabaseServidor();

    let query = supabase
      .from("produtos")
      .select(`
        *,
        lojas (
          id,
          nome
        )
      `)
      .order("created_at", { ascending: false });

    if (filtros?.lojaId) {
      query = query.eq("loja_id", filtros.lojaId);
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
      lojaId: p.loja_id,
      lojaNome: p.lojas?.nome ?? "Loja",
      nome: p.nome,
      descricao: p.descricao,
      preco: Number(p.preco),
      estoque: p.estoque,
      estoqueMinimo: p.estoque_minimo ?? 0,
      categoria: p.categoria,
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
        lojas (
          id,
          nome
        )
      `)
      .eq("id", id)
      .single();

    if (error || !p) {
      throw new ErroAplicacao("Produto não encontrado.", 404);
    }

    return {
      id: p.id,
      lojaId: p.loja_id,
      lojaNome: p.lojas?.nome ?? "Loja",
      nome: p.nome,
      descricao: p.descricao,
      preco: Number(p.preco),
      estoque: p.estoque,
      estoqueMinimo: p.estoque_minimo ?? 0,
      categoria: p.categoria,
      imagemUrl: p.imagem_url,
      ativo: p.ativo,
      createdAt: p.created_at
    };
  },

  async criarProduto(
    lojaId: string,
    dados: { nome: string; descricao: string; preco: number; estoque: number; estoqueMinimo?: number; categoria: string; imagemUrl?: string | null }
  ) {
    const supabase = criarClienteSupabaseServidor();

    const { data, error } = await supabase
      .from("produtos")
      .insert({
        loja_id: lojaId,
        nome: dados.nome,
        descricao: dados.descricao,
        preco: dados.preco,
        estoque: dados.estoque,
        estoque_minimo: dados.estoqueMinimo ?? 0,
        categoria: dados.categoria,
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
    lojaId: string,
    dados: { nome: string; descricao: string; preco: number; estoque: number; estoqueMinimo?: number; categoria: string; imagemUrl?: string | null; ativo?: boolean }
  ) {
    const supabase = criarClienteSupabaseServidor();

    const { data, error } = await supabase
      .from("produtos")
      .update({
        nome: dados.nome,
        descricao: dados.descricao,
        preco: dados.preco,
        estoque: dados.estoque,
        estoque_minimo: dados.estoqueMinimo ?? 0,
        categoria: dados.categoria,
        imagem_url: dados.imagemUrl,
        ativo: dados.ativo ?? true
      })
      .eq("id", produtoId)
      .eq("loja_id", lojaId)
      .select()
      .single();

    if (error) {
      throw new ErroAplicacao(error.message, 400);
    }

    return data;
  },

  async excluirProduto(produtoId: string, lojaId: string) {
    const supabase = criarClienteSupabaseServidor();

    const { error } = await supabase
      .from("produtos")
      .delete()
      .eq("id", produtoId)
      .eq("loja_id", lojaId);

    if (error) {
      throw new ErroAplicacao(error.message, 400);
    }

    return true;
  },

  async fazerUploadImagem(lojaId: string, arquivo: Buffer, nomeArquivo: string, mimeType: string) {
    const supabase = criarClienteSupabaseServidor();

    const extensao = nomeArquivo.split(".").pop();
    const caminhoArquivo = `${lojaId}/${Date.now()}.${extensao}`;

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
