"use client";

import { useState } from "react";
import { useBuscarDados } from "@/hooks/useBuscarDados";
import { EstadoCarregando } from "@/componentes/feedback/EstadoCarregando";
import { EstadoErro } from "@/componentes/feedback/EstadoErro";
import { EstadoVazio } from "@/componentes/feedback/EstadoVazio";
import { Botao } from "@/componentes/ui/Botao";
import { CampoTexto } from "@/componentes/ui/CampoTexto";
import { AreaTexto } from "@/componentes/ui/AreaTexto";
import { formatarMoeda } from "@/lib/utilitarios/datas";
import toast, { Toaster } from "react-hot-toast";
import { ShoppingBag, Box, AlertTriangle, Plus, Edit, Trash2, X, Archive } from "lucide-react";

export default function GestorProdutosPage() {
  const { dados: produtos, carregando, erro, recarregar } = useBuscarDados<any[]>("/api/gestor/produtos");

  const [modalAberto, setModalAberto] = useState(false);
  const [modalEdicao, setModalEdicao] = useState<any | null>(null);

  // Cadastro States
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [preco, setPreco] = useState("");
  const [estoque, setEstoque] = useState("");
  const [estoqueMinimo, setEstoqueMinimo] = useState("3");
  const [categoria, setCategoria] = useState("");
  const [imagemUrl, setImagemUrl] = useState("");
  const [submetendo, setSubmetendo] = useState(false);

  // Edição States
  const [editNome, setEditNome] = useState("");
  const [editDescricao, setEditDescricao] = useState("");
  const [editPreco, setEditPreco] = useState("");
  const [editEstoque, setEditEstoque] = useState("");
  const [editEstoqueMin, setEditEstoqueMin] = useState("");
  const [editCategoria, setEditCategoria] = useState("");
  const [editImagemUrl, setEditImagemUrl] = useState("");
  const [editAtivo, setEditAtivo] = useState(true);

  async function handleCadastrar(e: React.FormEvent) {
    e.preventDefault();
    if (!nome || !preco || !estoque || !categoria) return;

    setSubmetendo(true);
    try {
      const response = await fetch("/api/gestor/produtos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome,
          descricao,
          preco: Number(preco),
          estoque: Number(estoque),
          estoqueMinimo: Number(estoqueMinimo),
          categoria,
          imagemUrl
        })
      });
      const res = await response.json();
      if (response.ok && res.sucesso) {
        toast.success("Produto adicionado ao estoque!");
        // Limpar
        setNome("");
        setDescricao("");
        setPreco("");
        setEstoque("");
        setEstoqueMinimo("3");
        setCategoria("");
        setImagemUrl("");
        setModalAberto(false);
        recarregar();
      } else {
        toast.error(res.mensagem || "Erro ao adicionar produto.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Erro na conexão.");
    } finally {
      setSubmetendo(false);
    }
  }

  async function handleSalvarEdicao(e: React.FormEvent) {
    e.preventDefault();
    if (!modalEdicao) return;

    setSubmetendo(true);
    try {
      const response = await fetch(`/api/gestor/produtos/${modalEdicao.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: editNome,
          descricao: editDescricao,
          preco: Number(editPreco),
          estoque: Number(editEstoque),
          estoqueMinimo: Number(editEstoqueMin),
          categoria: editCategoria,
          imagemUrl: editImagemUrl,
          ativo: editAtivo
        })
      });
      const res = await response.json();
      if (response.ok && res.sucesso) {
        toast.success("Produto atualizado!");
        setModalEdicao(null);
        recarregar();
      } else {
        toast.error(res.mensagem || "Erro ao salvar.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Erro na conexão.");
    } finally {
      setSubmetendo(false);
    }
  }

  async function handleExcluir(id: string) {
    if (!confirm("Tem certeza de que deseja remover este produto de forma definitiva?")) return;

    try {
      const response = await fetch(`/api/gestor/produtos/${id}`, { method: "DELETE" });
      if (response.ok) {
        toast.success("Produto removido.");
        recarregar();
      } else {
        toast.error("Erro ao remover produto.");
      }
    } catch (err) {
      console.error(err);
    }
  }

  // Identificar produtos com estoque baixo
  const produtosEstoqueBaixo = produtos?.filter((p) => p.estoque <= p.estoqueMinimo) ?? [];

  return (
    <div className="container-pagina py-12 space-y-8">
      <Toaster position="top-center" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <p className="texto-destaque mb-2">ESTOQUE</p>
          <h1 className="text-4xl font-serif font-bold text-verde_petroleo">Controle de Estoque & Produtos</h1>
          <p className="text-texto_secundario">Cadastre itens para e-commerce, defina quantidades mínimas e receba alertas.</p>
        </div>
        <Botao onClick={() => setModalAberto(true)} className="flex items-center gap-2">
          <Plus className="h-5 w-5" /> Adicionar Produto
        </Botao>
      </div>

      {/* Alertas de Estoque Baixo */}
      {produtosEstoqueBaixo.length > 0 && (
        <div className="bg-red-50 border border-red-200 p-6 rounded-2xl space-y-3 max-w-2xl shadow-suave">
          <div className="flex items-center gap-3 text-red-800 font-bold text-base">
            <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0 animate-bounce" />
            <span>Alerta de Estoque Baixo! ({produtosEstoqueBaixo.length} itens necessitando reposição)</span>
          </div>
          <ul className="list-disc pl-6 text-xs text-red-700 space-y-1.5">
            {produtosEstoqueBaixo.map((p) => (
              <li key={p.id}>
                <strong>{p.nome}</strong> (Restam apenas {p.estoque} unidades. Mínimo tolerável: {p.estoqueMinimo})
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Grid Listagem */}
      {carregando ? (
        <EstadoCarregando texto="Carregando produtos cadastrados..." />
      ) : erro ? (
        <EstadoErro mensagem={erro} onTentarNovamente={recarregar} />
      ) : produtos && produtos.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {produtos.map((p) => {
            const estoqueBaixo = p.estoque <= p.estoqueMinimo;
            return (
              <div
                key={p.id}
                className={`cartao bg-white border p-5 hover:shadow-premium transition flex flex-col justify-between ${
                  !p.ativo ? "opacity-60 border-red-200" : estoqueBaixo ? "border-red-300 ring-1 ring-red-200" : "border-bege_borda"
                }`}
              >
                <div>
                  {/* Imagem do Produto */}
                  <div className="h-40 w-full bg-marfim rounded-xl overflow-hidden border border-bege_borda flex items-center justify-center mb-4 relative">
                    {p.imagemUrl ? (
                      <img src={p.imagemUrl} alt={p.nome} className="h-full w-full object-cover" />
                    ) : (
                      <ShoppingBag className="h-10 w-10 text-bege_borda" />
                    )}
                    {estoqueBaixo && (
                      <span className="absolute top-2 right-2 bg-red-600 text-white text-[9px] px-2.5 py-1 rounded-full font-bold shadow-suave uppercase tracking-wider flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" /> Estoque Baixo
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] bg-marfim text-dourado border border-bege_borda px-2.5 py-0.5 rounded-md font-black uppercase">
                        {p.categoria || "Geral"}
                      </span>
                      <span className={`text-[10px] font-bold uppercase ${p.ativo ? "text-green-700" : "text-red-700"}`}>
                        {p.ativo ? "Ativo" : "Inativo"}
                      </span>
                    </div>
                    <h4 className="font-bold text-texto_principal text-base pt-1">{p.nome}</h4>
                    <p className="text-xs text-texto_secundario line-clamp-2">{p.descricao || "Sem descrição cadastrada."}</p>
                  </div>
                </div>

                <div className="space-y-4 pt-5 border-t border-bege_borda/30 mt-4">
                  <div className="flex justify-between items-end text-xs text-texto_secundario">
                    <div className="space-y-0.5">
                      <p>Estoque: <strong className={estoqueBaixo ? "text-red-600" : ""}>{p.estoque} un</strong></p>
                      <p className="text-[10px]">Min. Tolerável: {p.estoqueMinimo} un</p>
                    </div>
                    <span className="font-serif font-black text-verde_petroleo text-lg">{formatarMoeda(p.preco)}</span>
                  </div>

                  {/* Ações */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setModalEdicao(p);
                        setEditNome(p.nome);
                        setEditDescricao(p.descricao || "");
                        setEditPreco(p.preco.toString());
                        setEditEstoque(p.estoque.toString());
                        setEditEstoqueMin(p.estoqueMinimo.toString());
                        setEditCategoria(p.categoria || "");
                        setEditImagemUrl(p.imagemUrl || "");
                        setEditAtivo(p.ativo);
                      }}
                      className="bg-marfim hover:bg-bege_borda text-verde_petroleo border border-bege_borda py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                    >
                      <Edit className="h-4 w-4" /> Editar
                    </button>
                    <button
                      onClick={() => handleExcluir(p.id)}
                      className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                    >
                      <Trash2 className="h-4 w-4" /> Excluir
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EstadoVazio titulo="Prateleira vazia" descricao="Clique em Adicionar Produto para registrar produtos físicos de e-commerce e vendas." />
      )}

      {/* MODAL CADASTRO */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-bege_borda rounded-3xl p-8 max-w-lg w-full space-y-6 shadow-premium relative animate-fade-in">
            <button onClick={() => setModalAberto(false)} className="absolute top-6 right-6 text-texto_secundario hover:text-texto_principal transition">
              <X className="h-6 w-6" />
            </button>
            <h3 className="text-2xl font-serif font-bold text-verde_petroleo flex items-center gap-2">
              <Box className="h-6 w-6 text-dourado" /> Novo Produto no Estoque
            </h3>

            <form onSubmit={handleCadastrar} className="space-y-4">
              <CampoTexto label="Nome do Produto" id="p-nome" placeholder="Ex: Pomada Modeladora Efeito Matte" value={nome} onChange={(e) => setNome(e.target.value)} required />
              <CampoTexto label="Categoria (Ex: Cabelo, Barba, Kit)" id="p-cat" value={categoria} onChange={(e) => setCategoria(e.target.value)} required />
              <div className="grid grid-cols-3 gap-3">
                <CampoTexto label="Preço (R$)" id="p-preco" type="number" step="0.01" placeholder="0,00" value={preco} onChange={(e) => setPreco(e.target.value)} required />
                <CampoTexto label="Estoque Atual" id="p-est" type="number" value={estoque} onChange={(e) => setEstoque(e.target.value)} required />
                <CampoTexto label="Estoque Mínimo" id="p-estmin" type="number" value={estoqueMinimo} onChange={(e) => setEstoqueMinimo(e.target.value)} required />
              </div>
              <CampoTexto label="URL da Imagem do Produto" id="p-img" placeholder="http://..." value={imagemUrl} onChange={(e) => setImagemUrl(e.target.value)} />
              <AreaTexto label="Descrição do Produto" id="p-desc" value={descricao} onChange={(e) => setDescricao(e.target.value)} />

              <Botao type="submit" larguraTotal disabled={submetendo}>
                {submetendo ? "Cadastrando..." : "Registrar Produto"}
              </Botao>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDICAO */}
      {modalEdicao && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-bege_borda rounded-3xl p-8 max-w-lg w-full space-y-6 shadow-premium relative animate-fade-in">
            <button onClick={() => setModalEdicao(null)} className="absolute top-6 right-6 text-texto_secundario hover:text-texto_principal transition">
              <X className="h-6 w-6" />
            </button>
            <h3 className="text-2xl font-serif font-bold text-verde_petroleo">Editar Produto</h3>

            <form onSubmit={handleSalvarEdicao} className="space-y-4">
              <CampoTexto label="Nome" id="e-nome" value={editNome} onChange={(e) => setEditNome(e.target.value)} required />
              <CampoTexto label="Categoria" id="e-cat" value={editCategoria} onChange={(e) => setEditCategoria(e.target.value)} required />
              <div className="grid grid-cols-3 gap-3">
                <CampoTexto label="Preço (R$)" id="e-preco" type="number" step="0.01" value={editPreco} onChange={(e) => setEditPreco(e.target.value)} required />
                <CampoTexto label="Estoque" id="e-est" type="number" value={editEstoque} onChange={(e) => setEditEstoque(e.target.value)} required />
                <CampoTexto label="Estoque Mínimo" id="e-estmin" type="number" value={editEstoqueMin} onChange={(e) => setEditEstoqueMin(e.target.value)} required />
              </div>
              <CampoTexto label="URL da Imagem" id="e-img" value={editImagemUrl} onChange={(e) => setEditImagemUrl(e.target.value)} />
              <AreaTexto label="Descrição" id="e-desc" value={editDescricao} onChange={(e) => setEditDescricao(e.target.value)} />

              <div className="flex items-center gap-2 py-1">
                <input
                  type="checkbox"
                  id="e-ativo"
                  checked={editAtivo}
                  onChange={(e) => setEditAtivo(e.target.checked)}
                  className="rounded border-bege_borda text-verde_petroleo focus:ring-verde_petroleo h-4.5 w-4.5"
                />
                <label htmlFor="e-ativo" className="text-xs font-bold text-texto_principal">
                  Produto Ativo (Visível no e-commerce para consumidores)
                </label>
              </div>

              <Botao type="submit" larguraTotal disabled={submetendo}>
                {submetendo ? "Salvando..." : "Salvar Alterações"}
              </Botao>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
