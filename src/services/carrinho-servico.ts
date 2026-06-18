import { criarClienteSupabaseServidor } from "@/lib/banco/supabase-server";
import { ErroAplicacao } from "@/lib/utilitarios/erro-aplicacao";

export const carrinhoServico = {
  async obterConsumidorId(usuarioId: string) {
    const supabase = criarClienteSupabaseServidor();
    const { data, error } = await supabase
      .from("consumidores")
      .select("id")
      .eq("usuario_id", usuarioId)
      .single();

    if (error || !data) {
      throw new ErroAplicacao("Perfil de consumidor não encontrado.", 404);
    }

    return data.id;
  },

  async obterOuCriarCarrinho(consumidorId: string) {
    const supabase = criarClienteSupabaseServidor();

    // Tenta buscar o carrinho ativo
    const { data: cart } = await supabase
      .from("carrinhos")
      .select("*")
      .eq("consumidor_id", consumidorId)
      .maybeSingle();

    if (cart) {
      return cart;
    }

    // Se não existir, cria um
    const { data: newCart, error: insertError } = await supabase
      .from("carrinhos")
      .insert({ consumidor_id: consumidorId })
      .select()
      .single();

    if (insertError) {
      throw new ErroAplicacao("Erro ao criar carrinho: " + insertError.message, 400);
    }

    return newCart;
  },

  async obterCarrinho(usuarioId: string) {
    const supabase = criarClienteSupabaseServidor();
    const consumidorId = await this.obterConsumidorId(usuarioId);
    const cart = await this.obterOuCriarCarrinho(consumidorId);

    // Busca itens do carrinho
    const { data: items, error } = await supabase
      .from("carrinho_itens")
      .select(`
        *,
        produtos (
          nome,
          imagem_url
        )
      `)
      .eq("carrinho_id", cart.id);

    if (error) {
      throw new ErroAplicacao(error.message, 400);
    }

    const mappedItems = items.map((i: any) => ({
      id: i.id,
      carrinhoId: i.carrinho_id,
      produtoId: i.produto_id,
      produtoNome: i.produtos?.nome ?? "Produto",
      produtoImagemUrl: i.produtos?.imagem_url ?? null,
      quantidade: i.quantidade,
      precoUnitario: Number(i.preco_unitario)
    }));

    return {
      id: cart.id,
      consumidorId: cart.consumidor_id,
      createdAt: cart.created_at,
      itens: mappedItems
    };
  },

  async adicionarItem(usuarioId: string, produtoId: string, quantidade: number) {
    const supabase = criarClienteSupabaseServidor();
    const consumidorId = await this.obterConsumidorId(usuarioId);
    const cart = await this.obterOuCriarCarrinho(consumidorId);

    // 1. Verifica preço e estoque do produto
    const { data: produto, error: prodError } = await supabase
      .from("produtos")
      .select("preco, estoque, ativo")
      .eq("id", produtoId)
      .single();

    if (prodError || !produto) {
      throw new ErroAplicacao("Produto não encontrado.", 404);
    }

    if (!produto.ativo) {
      throw new ErroAplicacao("Este produto está inativo.", 400);
    }

    if (produto.estoque < quantidade) {
      throw new ErroAplicacao(`Quantidade indisponível em estoque. Apenas ${produto.estoque} unidades disponíveis.`, 400);
    }

    // 2. Verifica se o produto já está no carrinho
    const { data: itemExistente } = await supabase
      .from("carrinho_itens")
      .select("*")
      .eq("carrinho_id", cart.id)
      .eq("produto_id", produtoId)
      .maybeSingle();

    if (itemExistente) {
      const novaQtde = itemExistente.quantidade + quantidade;
      if (produto.estoque < novaQtde) {
        throw new ErroAplicacao(`Quantidade total do carrinho excede estoque (${produto.estoque} unidades).`, 400);
      }

      const { data, error } = await supabase
        .from("carrinho_itens")
        .update({ quantidade: novaQtde })
        .eq("id", itemExistente.id)
        .select()
        .single();
      if (error) throw new ErroAplicacao(error.message, 400);
      return data;
    }

    // 3. Adiciona novo item
    const { data, error } = await supabase
      .from("carrinho_itens")
      .insert({
        carrinho_id: cart.id,
        produto_id: produtoId,
        quantidade,
        preco_unitario: produto.preco
      })
      .select()
      .single();

    if (error) {
      throw new ErroAplicacao(error.message, 400);
    }

    return data;
  },

  async atualizarItem(usuarioId: string, itemId: string, quantidade: number) {
    const supabase = criarClienteSupabaseServidor();
    const consumidorId = await this.obterConsumidorId(usuarioId);
    const cart = await this.obterOuCriarCarrinho(consumidorId);

    // 1. Busca o item para validar dono do carrinho
    const { data: item, error: fetchError } = await supabase
      .from("carrinho_itens")
      .select("*, produtos(estoque)")
      .eq("id", itemId)
      .eq("carrinho_id", cart.id)
      .single();

    if (fetchError || !item) {
      throw new ErroAplicacao("Item não encontrado no carrinho.", 404);
    }

    const estoqueDisponivel = (item.produtos as any)?.estoque ?? 0;
    if (estoqueDisponivel < quantidade) {
      throw new ErroAplicacao(`Quantidade indisponível em estoque. Apenas ${estoqueDisponivel} unidades disponíveis.`, 400);
    }

    // 2. Atualiza
    const { data, error } = await supabase
      .from("carrinho_itens")
      .update({ quantidade })
      .eq("id", itemId)
      .select()
      .single();

    if (error) {
      throw new ErroAplicacao(error.message, 400);
    }

    return data;
  },

  async removerItem(usuarioId: string, itemId: string) {
    const supabase = criarClienteSupabaseServidor();
    const consumidorId = await this.obterConsumidorId(usuarioId);
    const cart = await this.obterOuCriarCarrinho(consumidorId);

    const { error } = await supabase
      .from("carrinho_itens")
      .delete()
      .eq("id", itemId)
      .eq("carrinho_id", cart.id);

    if (error) {
      throw new ErroAplicacao(error.message, 400);
    }

    return true;
  },

  async limparCarrinho(usuarioId: string) {
    const supabase = criarClienteSupabaseServidor();
    const consumidorId = await this.obterConsumidorId(usuarioId);
    const cart = await this.obterOuCriarCarrinho(consumidorId);

    const { error } = await supabase
      .from("carrinho_itens")
      .delete()
      .eq("carrinho_id", cart.id);

    if (error) {
      throw new ErroAplicacao(error.message, 400);
    }

    return true;
  }
};
