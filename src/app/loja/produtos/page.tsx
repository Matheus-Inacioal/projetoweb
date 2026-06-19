"use client";

import { useState, useEffect } from "react";
import { useBuscarDados } from "@/hooks/useBuscarDados";
import { EstadoCarregando } from "@/componentes/feedback/EstadoCarregando";
import { EstadoErro } from "@/componentes/feedback/EstadoErro";
import { EstadoVazio } from "@/componentes/feedback/EstadoVazio";
import { Botao } from "@/componentes/ui/Botao";
import { formatarMoeda, formatarData } from "@/lib/utilitarios/datas";
import toast, { Toaster } from "react-hot-toast";
import { ShoppingBag, ShoppingCart, Package, Trash2, Plus, Minus, Search, CheckCircle, ExternalLink } from "lucide-react";

export default function ProdutosMarketplacePage() {
  const [abaAtiva, setAbaAtiva] = useState<"catalogo" | "carrinho" | "pedidos">("catalogo");
  const [lojaFiltro, setLojaFiltro] = useState("");
  const [adicionandoId, setAdicionandoId] = useState<string | null>(null);

  // Estados para exibição de PIX após checkout
  const [pixGerado, setPixGerado] = useState<any | null>(null);
  const [pedidoRecenteId, setPedidoRecenteId] = useState<string | null>(null);

  // 1. Busca Catálogo de Produtos e Lojas
  const { dados: produtos, carregando: cProdutos, erro: eProdutos, recarregar: rProdutos } =
    useBuscarDados<any[]>(lojaFiltro ? `/api/produtos?lojaId=${lojaFiltro}` : "/api/produtos");

  const { dados: lojas } = useBuscarDados<any[]>("/api/lojas");

  // 2. Busca Carrinho do Consumidor
  const { dados: carrinho, carregando: cCarrinho, recarregar: rCarrinho } =
    useBuscarDados<any>("/api/carrinho");

  // 3. Busca Pedidos do Consumidor
  const { dados: pedidos, carregando: cPedidos, recarregar: rPedidos } =
    useBuscarDados<any[]>("/api/pedidos");

  // Recarrega carrinho e pedidos ao alternar abas
  useEffect(() => {
    if (abaAtiva === "carrinho") rCarrinho();
    if (abaAtiva === "pedidos") rPedidos();
  }, [abaAtiva]);

  async function handleAdicionarAoCarrinho(produtoId: string) {
    setAdicionandoId(produtoId);
    try {
      const response = await fetch("/api/carrinho/itens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ produtoId, quantidade: 1 })
      });
      const res = await response.json();
      if (response.ok && res.sucesso) {
        toast.success(res.mensagem || "Adicionado ao carrinho!");
        rCarrinho();
      } else {
        toast.error(res.mensagem || "Erro ao adicionar ao carrinho.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Erro ao conectar ao servidor.");
    } finally {
      setAdicionandoId(null);
    }
  }

  async function handleMudarQuantidade(itemId: string, novaQtde: number) {
    if (novaQtde <= 0) {
      await handleRemoverItem(itemId);
      return;
    }

    try {
      const response = await fetch(`/api/carrinho/itens/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantidade: novaQtde })
      });
      if (response.ok) {
        rCarrinho();
      } else {
        const res = await response.json();
        toast.error(res.mensagem || "Erro ao atualizar quantidade.");
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleRemoverItem(itemId: string) {
    try {
      const response = await fetch(`/api/carrinho/itens/${itemId}`, {
        method: "DELETE"
      });
      if (response.ok) {
        toast.success("Item removido do carrinho.");
        rCarrinho();
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleFinalizarCompra() {
    if (!carrinho?.itens || carrinho.itens.length === 0) return;

    try {
      // 1. Cria o Pedido
      const responsePedido = await fetch("/api/pedidos", {
        method: "POST"
      });
      const resPedido = await responsePedido.json();

      if (!responsePedido.ok || !resPedido.sucesso) {
        toast.error(resPedido.mensagem || "Erro ao fechar o pedido.");
        return;
      }

      const pedidoId = resPedido.dados.id;
      setPedidoRecenteId(pedidoId);

      // 2. Cria o Pagamento PIX
      const responsePag = await fetch(`/api/pagamentos/pedido/${pedidoId}`, {
        method: "POST"
      });
      const resPag = await responsePag.json();

      if (responsePag.ok && resPag.sucesso) {
        setPixGerado(resPag.dados);
        toast.success("Pedido fechado! Use o PIX abaixo para pagar.");
        setAbaAtiva("pedidos");
        rPedidos();
      } else {
        toast.error("Pedido criado, mas falhou ao gerar QR Code PIX.");
        setAbaAtiva("pedidos");
        rPedidos();
      }
    } catch (err) {
      console.error(err);
      toast.error("Erro no processamento da compra.");
    }
  }

  async function handleSimularPagamento(pedidoId: string) {
    try {
      const response = await fetch(`/api/pedidos/${pedidoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "pago" })
      });
      const res = await response.json();
      if (response.ok && res.sucesso) {
        toast.success("Simulação: Pagamento Aprovado via PIX!");
        setPixGerado(null);
        setPedidoRecenteId(null);
        rPedidos();
      } else {
        toast.error(res.mensagem || "Erro na simulação.");
      }
    } catch (err) {
      console.error(err);
    }
  }

  const calcularTotalCarrinho = () => {
    if (!carrinho?.itens) return 0;
    return carrinho.itens.reduce((acc: number, item: any) => acc + (item.precoUnitario * item.quantidade), 0);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "aguardando_pagamento":
        return "bg-amber-100 text-amber-800";
      case "pago":
        return "bg-green-100 text-green-800";
      case "enviado":
        return "bg-blue-100 text-blue-800";
      case "entregue":
        return "bg-teal-100 text-teal-800";
      case "cancelado":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "aguardando_pagamento":
        return "Aguardando Pagamento";
      case "pago":
        return "Pago / Preparando";
      case "enviado":
        return "Enviado";
      case "entregue":
        return "Entregue";
      case "cancelado":
        return "Cancelado";
      default:
        return status;
    }
  };

  return (
    <div className="container-pagina py-12 space-y-10">
      <Toaster position="top-center" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <p className="texto-destaque mb-2">PRODUTOS</p>
          <h1 className="text-4xl font-serif font-bold text-verde_petroleo">Marketplace de Produtos</h1>
          <p className="text-texto_secundario">Navegue pelas prateleiras das melhores barbearias parceiras.</p>
        </div>

        {/* Abas */}
        <div className="flex bg-marfim border border-bege_borda p-1.5 rounded-2xl shadow-suave">
          <button
            onClick={() => setAbaAtiva("catalogo")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-serif font-bold text-sm transition ${
              abaAtiva === "catalogo" ? "bg-verde_petroleo text-off_white" : "text-texto_secundario hover:text-texto_principal"
            }`}
          >
            <ShoppingBag className="h-4 w-4" /> Catálogo
          </button>
          <button
            onClick={() => setAbaAtiva("carrinho")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-serif font-bold text-sm transition ${
              abaAtiva === "carrinho" ? "bg-verde_petroleo text-off_white" : "text-texto_secundario hover:text-texto_principal"
            }`}
          >
            <ShoppingCart className="h-4 w-4" /> Carrinho ({carrinho?.itens?.length ?? 0})
          </button>
          <button
            onClick={() => setAbaAtiva("pedidos")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-serif font-bold text-sm transition ${
              abaAtiva === "pedidos" ? "bg-verde_petroleo text-off_white" : "text-texto_secundario hover:text-texto_principal"
            }`}
          >
            <Package className="h-4 w-4" /> Meus Pedidos ({pedidos?.length ?? 0})
          </button>
        </div>
      </div>

      {/* ABA: CATALOGO */}
      {abaAtiva === "catalogo" && (
        <div className="space-y-8">
          {/* Filtro por loja */}
          <div className="flex items-center gap-4 bg-marfim p-6 rounded-2xl border border-bege_borda max-w-md">
            <Search className="h-5 w-5 text-dourado flex-shrink-0" />
            <div className="flex-grow">
              <label htmlFor="select-loja" className="sr-only">Escolher barbearia</label>
              <select
                id="select-loja"
                value={lojaFiltro}
                onChange={(e) => setLojaFiltro(e.target.value)}
                className="w-full bg-transparent font-serif font-bold text-sm text-verde_petroleo focus:outline-none cursor-pointer"
              >
                <option value="">Todas as Barbearias</option>
                {lojas?.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.nome} ({l.cidade})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {cProdutos ? (
            <EstadoCarregando texto="Buscando produtos..." />
          ) : eProdutos ? (
            <EstadoErro mensagem={eProdutos} onTentarNovamente={rProdutos} />
          ) : produtos && produtos.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {produtos.map((p) => (
                <div key={p.id} className="cartao bg-white border border-bege_borda p-5 hover:shadow-premium transition flex flex-col justify-between">
                  <div>
                    {/* Imagem */}
                    <div className="h-44 w-full bg-marfim rounded-xl overflow-hidden border border-bege_borda flex items-center justify-center mb-4">
                      {p.imagemUrl ? (
                        <img src={p.imagemUrl} alt={p.nome} className="h-full w-full object-cover" />
                      ) : (
                        <ShoppingBag className="h-12 w-12 text-bege_borda" />
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center gap-2">
                        <span className="text-[9px] bg-marfim text-dourado border border-bege_borda px-2 py-0.5 rounded font-bold uppercase">
                          {p.categoria || "Geral"}
                        </span>
                        <span className="text-[10px] text-texto_secundario font-medium">
                          🏪 {p.lojaNome}
                        </span>
                      </div>
                      <h4 className="font-bold text-texto_principal text-base pt-1">{p.nome}</h4>
                      <p className="text-xs text-texto_secundario line-clamp-2">{p.descricao || "Sem descrição do produto."}</p>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4">
                    <div className="flex justify-between items-end">
                      <span className="text-xs text-texto_secundario">Estoque: {p.estoque} un</span>
                      <span className="font-serif font-black text-verde_petroleo text-lg">{formatarMoeda(p.preco)}</span>
                    </div>
                    <Botao
                      onClick={() => handleAdicionarAoCarrinho(p.id)}
                      larguraTotal
                      disabled={adicionandoId === p.id || p.estoque <= 0}
                    >
                      {p.estoque <= 0
                        ? "Indisponível"
                        : adicionandoId === p.id
                        ? "Adicionando..."
                        : "Adicionar ao Carrinho"}
                    </Botao>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EstadoVazio titulo="Nenhum produto cadastrado" descricao="Nossos estabelecimentos ainda não anunciaram produtos para esta busca." />
          )}
        </div>
      )}

      {/* ABA: CARRINHO */}
      {abaAtiva === "carrinho" && (
        <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
          {/* Itens */}
          <div className="space-y-4">
            <h3 className="text-xl font-serif font-bold text-texto_principal flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-dourado" /> Sacola de Compras
            </h3>

            {cCarrinho ? (
              <p className="text-sm text-texto_secundario animate-pulse">Carregando sacola...</p>
            ) : carrinho?.itens && carrinho.itens.length > 0 ? (
              <div className="space-y-3">
                {carrinho.itens.map((item: any) => (
                  <div key={item.id} className="bg-white border border-bege_borda p-5 rounded-2xl flex items-center justify-between shadow-suave gap-4">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 bg-marfim border border-bege_borda rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0">
                        {item.produtoImagemUrl ? (
                          <img src={item.produtoImagemUrl} alt={item.produtoNome} className="h-full w-full object-cover" />
                        ) : (
                          <ShoppingBag className="h-6 w-6 text-bege_borda" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-texto_principal text-base">{item.produtoNome}</h4>
                        <p className="text-xs text-verde_petroleo font-bold">{formatarMoeda(item.precoUnitario)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 flex-shrink-0">
                      {/* Qtd Controls */}
                      <div className="flex items-center gap-2 border border-bege_borda rounded-xl p-1 bg-marfim">
                        <button
                          onClick={() => handleMudarQuantidade(item.id, item.quantidade - 1)}
                          className="h-7 w-7 rounded-lg hover:bg-bege_borda flex items-center justify-center text-texto_secundario transition"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="font-serif font-bold text-sm w-6 text-center">{item.quantidade}</span>
                        <button
                          onClick={() => handleMudarQuantidade(item.id, item.quantidade + 1)}
                          className="h-7 w-7 rounded-lg hover:bg-bege_borda flex items-center justify-center text-texto_secundario transition"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => handleRemoverItem(item.id)}
                        className="text-red-500 hover:text-red-700 transition"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EstadoVazio titulo="Sua sacola está vazia" descricao="Navegue pelo catálogo e adicione produtos que deseja comprar." />
            )}
          </div>

          {/* Resumo e Checkout */}
          <div className="bg-marfim border border-bege_borda p-6 rounded-2xl h-fit space-y-6">
            <h3 className="font-serif font-bold text-lg text-verde_petroleo">Resumo da Compra</h3>
            <div className="space-y-3 text-sm text-texto_secundario border-b border-bege_borda pb-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatarMoeda(calcularTotalCarrinho())}</span>
              </div>
              <div className="flex justify-between">
                <span>Frete / Retirada</span>
                <span className="text-green-600 font-bold">Grátis</span>
              </div>
            </div>
            <div className="flex justify-between font-serif font-black text-lg text-texto_principal">
              <span>Total Geral</span>
              <span>{formatarMoeda(calcularTotalCarrinho())}</span>
            </div>

            <Botao
              onClick={handleFinalizarCompra}
              larguraTotal
              disabled={!carrinho?.itens || carrinho.itens.length === 0}
            >
              Comprar e Pagar via PIX
            </Botao>
          </div>
        </div>
      )}

      {/* ABA: PEDIDOS */}
      {abaAtiva === "pedidos" && (
        <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
          {/* Lista de Pedidos */}
          <div className="space-y-4">
            <h3 className="text-xl font-serif font-bold text-texto_principal flex items-center gap-2">
              <Package className="h-5 w-5 text-dourado" /> Histórico de Pedidos
            </h3>

            {cPedidos ? (
              <p className="text-sm text-texto_secundario animate-pulse">Carregando pedidos...</p>
            ) : pedidos && pedidos.length > 0 ? (
              <div className="space-y-4">
                {pedidos.map((pd) => (
                  <div
                    key={pd.id}
                    className={`bg-white border p-6 rounded-2xl shadow-suave space-y-4 cursor-pointer transition ${
                      pedidoRecenteId === pd.id ? "border-dourado ring-1 ring-dourado" : "border-bege_borda"
                    }`}
                    onClick={() => {
                      setPedidoRecenteId(pd.id);
                      // Se o pedido estiver aguardando pagamento, busca/gera PIX dele
                      if (pd.status === "aguardando_pagamento") {
                        fetch(`/api/pagamentos/pedido/${pd.id}`, { method: "POST" })
                          .then((r) => r.json())
                          .then((res) => {
                            if (res.sucesso) setPixGerado(res.dados);
                          });
                      } else {
                        setPixGerado(null);
                      }
                    }}
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div>
                        <p className="font-bold text-sm text-texto_principal">Pedido #{pd.id.slice(0, 8)}</p>
                        <p className="text-[11px] text-texto_secundario">{formatarData(pd.createdAt)}</p>
                      </div>
                      <span className={`text-[11px] px-3 py-1 rounded-full font-bold ${getStatusBadgeClass(pd.status)}`}>
                        {getStatusLabel(pd.status)}
                      </span>
                    </div>

                    {/* Itens */}
                    <div className="text-xs text-texto_secundario space-y-1 bg-marfim p-3 rounded-xl border border-bege_borda">
                      {pd.itens?.map((it: any) => (
                        <div key={it.id} className="flex justify-between">
                          <span>{it.quantidade}x {it.produtoNome}</span>
                          <span className="font-semibold">{formatarMoeda(it.precoUnitario * it.quantidade)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-end pt-1">
                      <span className="text-xs text-texto_secundario">Total</span>
                      <span className="font-serif font-black text-verde_petroleo text-base">{formatarMoeda(pd.valorTotal)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EstadoVazio titulo="Nenhum pedido efetuado" descricao="Você ainda não comprou produtos em nossa plataforma." />
            )}
          </div>

          {/* Detalhe de Pagamento / Acompanhamento */}
          <div className="h-fit">
            {pedidoRecenteId ? (
              <div className="bg-gradient-to-br from-off_white to-marfim border border-bege_borda p-6 rounded-2xl space-y-6 sticky top-8 shadow-suave">
                <h3 className="font-serif font-bold text-lg text-verde_petroleo border-b border-bege_borda pb-2 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-dourado" /> Acompanhamento de Pedido
                </h3>

                {/* Se estiver aguardando pagamento e o pixGerado estiver ativo */}
                {pixGerado && (
                  <div className="space-y-6 text-center">
                    <p className="text-sm font-semibold text-texto_principal">Pague com o PIX abaixo:</p>
                    <div className="bg-white p-4 rounded-2xl border border-bege_borda inline-block shadow-suave">
                      {pixGerado.qr_code_base64 ? (
                        <img
                          src={`data:image/png;base64,${pixGerado.qr_code_base64}`}
                          alt="QR Code PIX"
                          className="h-44 w-44 object-contain mx-auto"
                        />
                      ) : (
                        <div className="h-44 w-44 flex items-center justify-center border border-dashed border-bege_borda text-xs text-texto_secundario">
                          [QR Code Indisponível]
                        </div>
                      )}
                    </div>

                    <div className="text-left space-y-2">
                      <label htmlFor="pix-copia-cola" className="text-xs font-bold text-texto_secundario">Código Copia e Cola:</label>
                      <input
                        id="pix-copia-cola"
                        readOnly
                        value={pixGerado.qr_code || ""}
                        className="w-full text-xs bg-white border border-bege_borda p-2 rounded-xl text-ellipsis select-all focus:outline-none"
                        onClick={(e) => (e.target as HTMLInputElement).select()}
                      />
                    </div>

                    <div className="pt-2 space-y-2">
                      <p className="text-[11px] text-texto_secundario">
                        Simule a aprovação do PIX para fins de apresentação acadêmica.
                      </p>
                      <Botao onClick={() => handleSimularPagamento(pedidoRecenteId)} larguraTotal>
                        Simular PIX Pago
                      </Botao>
                    </div>
                  </div>
                )}

                {/* Se o pedido já estiver pago */}
                {!pixGerado && (
                  <div className="space-y-4">
                    <div className="bg-white p-4 rounded-xl border border-bege_borda space-y-3">
                      <p className="text-xs text-texto_secundario uppercase font-bold tracking-wider">Status do Envio</p>
                      <div className="relative pl-6 space-y-4 border-l-2 border-bege_borda">
                        <div className="relative">
                          <span className="absolute -left-7.5 top-0.5 h-3.5 w-3.5 rounded-full bg-green-500 border border-white"></span>
                          <p className="text-xs font-bold text-texto_principal">Pedido Confirmado</p>
                          <p className="text-[10px] text-texto_secundario">O pagamento foi aprovado com sucesso.</p>
                        </div>
                        <div className="relative">
                          <span className="absolute -left-7.5 top-0.5 h-3.5 w-3.5 rounded-full bg-verde_petroleo border border-white"></span>
                          <p className="text-xs font-bold text-texto_principal">Preparando Pedido</p>
                          <p className="text-[10px] text-texto_secundario">A barbearia está embalando seus itens.</p>
                        </div>
                        <div className="relative">
                          <span className="absolute -left-7.5 top-0.5 h-3.5 w-3.5 rounded-full bg-gray-300 border border-white"></span>
                          <p className="text-xs font-bold text-texto_secundario">Pedido Enviado</p>
                          <p className="text-[10px] text-texto_secundario">Aguardando saída para entrega.</p>
                        </div>
                      </div>
                    </div>

                    {/* Botões do gestor para fins de simulação de avanço */}
                    <div className="bg-white p-4 rounded-xl border border-bege_borda space-y-2">
                      <p className="text-[10px] font-bold text-texto_secundario uppercase tracking-wide">
                        [Ações Acadêmicas] Simular Entrega
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={async () => {
                            await fetch(`/api/pedidos/${pedidoRecenteId}`, {
                              method: "PUT",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ status: "enviado" })
                            });
                            rPedidos();
                          }}
                          className="bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs py-2 rounded-lg font-bold transition"
                        >
                          Simular Envio
                        </button>
                        <button
                          onClick={async () => {
                            await fetch(`/api/pedidos/${pedidoRecenteId}`, {
                              method: "PUT",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ status: "entregue" })
                            });
                            rPedidos();
                          }}
                          className="bg-teal-50 text-teal-700 hover:bg-teal-100 text-xs py-2 rounded-lg font-bold transition"
                        >
                          Simular Entregue
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="border border-dashed border-bege_borda p-8 rounded-2xl text-center text-texto_secundario text-sm">
                Selecione um pedido ao lado para visualizar os detalhes de envio ou pagar via PIX.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
