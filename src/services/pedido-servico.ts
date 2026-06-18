import { criarClienteSupabaseServidor } from "@/lib/banco/supabase-server";
import { ErroAplicacao } from "@/lib/utilitarios/erro-aplicacao";
import { carrinhoServico } from "@/services/carrinho-servico";

export const pedidoServico = {
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

  async criarPedido(usuarioId: string) {
    const supabase = criarClienteSupabaseServidor();
    const consumidorId = await this.obterConsumidorId(usuarioId);

    // 1. Busca os itens no carrinho do consumidor
    const carrinho = await carrinhoServico.obterCarrinho(usuarioId);
    if (!carrinho.itens || carrinho.itens.length === 0) {
      throw new ErroAplicacao("O carrinho está vazio.", 400);
    }

    // 2. Transação manual: verifica estoque e calcula total
    let valorTotal = 0;
    const itensParaSalvar = [];

    for (const item of carrinho.itens) {
      // Re-busca o produto para checar estoque atualizado e preço
      const { data: produto, error } = await supabase
        .from("produtos")
        .select("preco, estoque, ativo")
        .eq("id", item.produtoId)
        .single();

      if (error || !produto) {
        throw new ErroAplicacao(`Produto ID ${item.produtoId} não encontrado.`, 404);
      }

      if (!produto.ativo) {
        throw new ErroAplicacao(`Produto "${item.produtoNome}" está inativo no momento.`, 400);
      }

      if (produto.estoque < item.quantidade) {
        throw new ErroAplicacao(`Estoque insuficiente para o produto "${item.produtoNome}". Apenas ${produto.estoque} disponíveis.`, 400);
      }

      valorTotal += Number(produto.preco) * item.quantidade;
      itensParaSalvar.push({
        produtoId: item.produtoId,
        quantidade: item.quantidade,
        precoUnitario: Number(produto.preco),
        novoEstoque: produto.estoque - item.quantidade
      });
    }

    // 3. Insere o Pedido
    const { data: pedido, error: pedError } = await supabase
      .from("pedidos")
      .insert({
        consumidor_id: consumidorId,
        valor_total: valorTotal,
        status: "aguardando_pagamento"
      })
      .select()
      .single();

    if (pedError) {
      throw new ErroAplicacao("Erro ao registrar o pedido: " + pedError.message, 400);
    }

    // 4. Salva os Itens do Pedido e Atualiza o Estoque dos Produtos
    for (const item of itensParaSalvar) {
      // Salva item do pedido
      const { error: itemError } = await supabase
        .from("pedido_itens")
        .insert({
          pedido_id: pedido.id,
          produto_id: item.produtoId,
          quantidade: item.quantidade,
          preco_unitario: item.precoUnitario
        });

      if (itemError) {
        throw new ErroAplicacao("Erro ao salvar itens do pedido: " + itemError.message, 400);
      }

      // Atualiza o estoque do produto
      const { error: stockError } = await supabase
        .from("produtos")
        .update({ estoque: item.novoEstoque })
        .eq("id", item.produtoId);

      if (stockError) {
        console.error(`Erro ao atualizar estoque do produto ${item.produtoId}:`, stockError.message);
      }
    }

    // 5. Limpa o carrinho
    await carrinhoServico.limparCarrinho(usuarioId);

    return pedido;
  },

  async listarPedidosConsumidor(usuarioId: string) {
    const supabase = criarClienteSupabaseServidor();
    const consumidorId = await this.obterConsumidorId(usuarioId);

    const { data, error } = await supabase
      .from("pedidos")
      .select(`
        *,
        pedido_itens (
          *,
          produtos (
            nome
          )
        )
      `)
      .eq("consumidor_id", consumidorId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new ErroAplicacao(error.message, 400);
    }

    return data.map((p: any) => ({
      id: p.id,
      consumidorId: p.consumidor_id,
      valorTotal: Number(p.valor_total),
      status: p.status,
      createdAt: p.created_at,
      itens: p.pedido_itens.map((i: any) => ({
        id: i.id,
        pedidoId: i.pedido_id,
        produtoId: i.produto_id,
        produtoNome: i.produtos?.nome ?? "Produto",
        quantidade: i.quantidade,
        precoUnitario: Number(i.preco_unitario)
      }))
    }));
  },

  async obterPedidoPorId(usuarioId: string, pedidoId: string) {
    const supabase = criarClienteSupabaseServidor();
    const consumidorId = await this.obterConsumidorId(usuarioId);

    const { data: p, error } = await supabase
      .from("pedidos")
      .select(`
        *,
        pedido_itens (
          *,
          produtos (
            nome
          )
        )
      `)
      .eq("id", pedidoId)
      .eq("consumidor_id", consumidorId)
      .single();

    if (error || !p) {
      throw new ErroAplicacao("Pedido não encontrado.", 404);
    }

    return {
      id: p.id,
      consumidorId: p.consumidor_id,
      valorTotal: Number(p.valor_total),
      status: p.status,
      createdAt: p.created_at,
      itens: p.pedido_itens.map((i: any) => ({
        id: i.id,
        pedidoId: i.pedido_id,
        produtoId: i.produto_id,
        produtoNome: i.produtos?.nome ?? "Produto",
        quantidade: i.quantidade,
        precoUnitario: Number(i.preco_unitario)
      }))
    };
  },

  async atualizarStatusPedido(pedidoId: string, status: string) {
    const supabase = criarClienteSupabaseServidor();

    const { data, error } = await supabase
      .from("pedidos")
      .update({ status })
      .eq("id", pedidoId)
      .select()
      .single();

    if (error) {
      throw new ErroAplicacao(error.message, 400);
    }

    return data;
  }
};
