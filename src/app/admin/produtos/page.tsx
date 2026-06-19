"use client";

import { useState, useEffect } from "react";
import { criarClienteSupabaseNavegador } from "@/lib/banco/supabase-client";
import { EstadoCarregando } from "@/componentes/feedback/EstadoCarregando";
import { Search, Plus, Edit, Trash2, X, ShoppingBag, DollarSign, Package, Tag, Image as ImageIcon } from "lucide-react";
import toast from "react-hot-toast";

interface Produto {
  id: string;
  prestador_id: string;
  nome: string;
  descricao: string;
  preco: number;
  estoque: number;
  imagem_url: string | null;
  categoria: string;
  ativo: boolean;
  prestadores: {
    usuarios: {
      nome: string;
    } | null;
  } | null;
}

interface PrestadorDropdown {
  id: string;
  nome: string;
}

const CATEGORIAS = ["Cabelo", "Barba", "Finalizadores", "Acessórios", "Kits", "Outros"];

export default function ProdutosAdminPage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [prestadores, setPrestadores] = useState<PrestadorDropdown[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("todos");

  // Form Modal state
  const [modalAberto, setModalAberto] = useState(false);
  const [produtoEditando, setProdutoEditando] = useState<Produto | null>(null);
  const [formPrestadorId, setFormPrestadorId] = useState("");
  const [formNome, setFormNome] = useState("");
  const [formDescricao, setFormDescricao] = useState("");
  const [formPreco, setFormPreco] = useState("");
  const [formEstoque, setFormEstoque] = useState("10");
  const [formCategoria, setFormCategoria] = useState("Cabelo");
  const [formImagemUrl, setFormImagemUrl] = useState("");
  const [formAtivo, setFormAtivo] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [enviandoImagem, setEnviandoImagem] = useState(false);

  const supabase = criarClienteSupabaseNavegador();

  const carregarDados = async () => {
    try {
      setCarregando(true);
      
      // Carrega prestadores
      const { data: pData, error: pErr } = await supabase
        .from("prestadores")
        .select("id, usuarios(nome)");
      if (pErr) throw pErr;
      
      setPrestadores(
        (pData || []).map((p: any) => ({
          id: p.id,
          nome: p.usuarios?.nome || "Prestador Sem Nome"
        }))
      );

      // Carrega produtos
      const { data: prData, error: prErr } = await supabase
        .from("produtos")
        .select("*, prestadores(usuarios(nome))")
        .order("created_at", { ascending: false });
      if (prErr) throw prErr;
      
      setProdutos((prData as any) || []);
    } catch (err: any) {
      toast.error("Erro ao carregar dados: " + err.message);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const uploadImagem = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setEnviandoImagem(true);
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `itens/${fileName}`;

      // Upload file directly to Supabase storage bucket "produtos"
      const { error: uploadError } = await supabase.storage
        .from("produtos")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Fetch public link
      const { data: { publicUrl } } = supabase.storage
        .from("produtos")
        .getPublicUrl(filePath);

      setFormImagemUrl(publicUrl);
      toast.success("Imagem enviada com sucesso!");
    } catch (err: any) {
      toast.error("Erro no upload da imagem: " + err.message);
    } finally {
      setEnviandoImagem(false);
    }
  };

  const abrirNovo = () => {
    setProdutoEditando(null);
    setFormPrestadorId(prestadores[0]?.id || "");
    setFormNome("");
    setFormDescricao("");
    setFormPreco("");
    setFormEstoque("10");
    setFormCategoria("Cabelo");
    setFormImagemUrl("");
    setFormAtivo(true);
    setModalAberto(true);
  };

  const abrirEdicao = (p: Produto) => {
    setProdutoEditando(p);
    setFormPrestadorId(p.prestador_id);
    setFormNome(p.nome);
    setFormDescricao(p.descricao);
    setFormPreco(String(p.preco));
    setFormEstoque(String(p.estoque));
    setFormCategoria(p.categoria);
    setFormImagemUrl(p.imagem_url || "");
    setFormAtivo(p.ativo);
    setModalAberto(true);
  };

  const salvarProduto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNome || !formPreco || !formEstoque) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }

    try {
      setSalvando(true);
      const payload = {
        prestador_id: formPrestadorId,
        nome: formNome,
        descricao: formDescricao,
        preco: parseFloat(formPreco),
        estoque: parseInt(formEstoque),
        categoria: formCategoria,
        imagem_url: formImagemUrl || null,
        ativo: formAtivo
      };

      if (produtoEditando) {
        const { error } = await supabase
          .from("produtos")
          .update(payload)
          .eq("id", produtoEditando.id);
        if (error) throw error;
        toast.success("Produto atualizado!");
      } else {
        const { error } = await supabase
          .from("produtos")
          .insert(payload);
        if (error) throw error;
        toast.success("Produto adicionado ao estoque!");
      }

      setModalAberto(false);
      carregarDados();
    } catch (err: any) {
      toast.error("Erro ao salvar: " + err.message);
    } finally {
      setSalvando(false);
    }
  };

  const excluirProduto = async (id: string) => {
    if (!confirm("Tem certeza de que deseja remover permanentemente este produto?")) return;

    try {
      const { error } = await supabase
        .from("produtos")
        .delete()
        .eq("id", id);
      if (error) throw error;

      setProdutos(produtos.filter(p => p.id !== id));
      toast.success("Produto removido com sucesso!");
    } catch (err: any) {
      toast.error("Erro ao remover produto: " + err.message);
    }
  };

  const filtrados = produtos.filter(p => {
    const nome = p.nome || "";
    const prestador = p.prestadores?.usuarios?.nome || "";
    const query = busca.toLowerCase();

    const matchesQuery = nome.toLowerCase().includes(query) || prestador.toLowerCase().includes(query);
    const matchesCategory = filtroCategoria === "todos" || p.categoria === filtroCategoria;

    return matchesQuery && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="texto-destaque mb-1">Módulos de Controle</p>
          <h1 className="text-3xl font-serif font-bold text-verde_petroleo">Estoque de Produtos</h1>
          <p className="text-sm text-texto_secundario">Controle produtos físicos à venda, controle estoques e gerencie imagens públicas.</p>
        </div>
        <button
          onClick={abrirNovo}
          className="botao-premium flex items-center justify-center gap-1.5 self-start py-2.5 px-4 font-bold"
        >
          <Plus className="w-5 h-5" />
          Adicionar Produto
        </button>
      </div>

      {/* Barra de Filtros */}
      <div className="flex flex-col md:flex-row gap-4 items-center bg-off_white p-4 rounded-xl border border-bege_borda shadow-suave">
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-texto_secundario" />
          <input
            type="text"
            placeholder="Buscar produto por nome ou loja..."
            className="campo-base pl-10"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Tag className="w-4 h-4 text-texto_secundario shrink-0" />
          <select
            className="campo-base py-2"
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
          >
            <option value="todos">Todas as Categorias</option>
            {CATEGORIAS.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabela de Produtos */}
      {carregando ? (
        <EstadoCarregando texto="Carregando produtos..." />
      ) : (
        <div className="cartao overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-verde_petroleo/5 border-b border-bege_borda text-xs font-semibold text-verde_petroleo uppercase tracking-wider">
                <th className="p-4">Imagem</th>
                <th className="p-4">Produto</th>
                <th className="p-4">Prestador Vendedor</th>
                <th className="p-4">Estoque</th>
                <th className="p-4">Preço</th>
                <th className="p-4">Categoria</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bege_borda text-sm text-texto_principal">
              {filtrados.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-texto_secundario font-medium">
                    Nenhum produto em estoque encontrado.
                  </td>
                </tr>
              ) : (
                filtrados.map((p) => (
                  <tr key={p.id} className="hover:bg-bege_borda/10 transition">
                    <td className="p-4">
                      {p.imagem_url ? (
                        <img
                          src={p.imagem_url}
                          alt={p.nome}
                          className="w-12 h-12 object-cover rounded-lg border border-bege_borda bg-marfim"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-verde_petroleo/5 border border-bege_borda flex items-center justify-center text-texto_secundario">
                          <ImageIcon className="w-5 h-5" />
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-semibold text-verde_petroleo">{p.nome}</p>
                        {p.descricao && <p className="text-xs text-texto_secundario line-clamp-1">{p.descricao}</p>}
                      </div>
                    </td>
                    <td className="p-4 text-texto_secundario font-medium">
                      {p.prestadores?.usuarios?.nome || "Não atribuído"}
                    </td>
                    <td className="p-4">
                      <span className={`font-semibold ${
                        p.estoque <= 3 ? "text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded" : "text-texto_principal"
                      }`}>
                        {p.estoque} un
                      </span>
                    </td>
                    <td className="p-4 font-serif font-bold text-verde_escuro">
                      R$ {Number(p.preco).toFixed(2)}
                    </td>
                    <td className="p-4 text-texto_secundario">
                      {p.categoria}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        p.ativo ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                      }`}>
                        {p.ativo ? "Ativo" : "Indisponível"}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => abrirEdicao(p)}
                          className="p-1.5 text-texto_secundario hover:text-dourado hover:bg-dourado/10 rounded transition"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => excluirProduto(p.id)}
                          className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded transition"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal CRUD Form */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-off_white rounded-2xl border border-bege_borda shadow-premium w-full max-w-md p-6 relative">
            <button
              onClick={() => setModalAberto(false)}
              className="absolute right-4 top-4 p-1 hover:bg-bege_borda/20 rounded-full text-texto_secundario transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-serif font-bold text-verde_petroleo mb-6 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-dourado" />
              {produtoEditando ? "Editar Produto" : "Novo Produto"}
            </h2>

            <form onSubmit={salvarProduto} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-texto_secundario uppercase mb-1.5">
                  Prestador Vendedor *
                </label>
                <select
                  required
                  className="campo-base font-medium"
                  value={formPrestadorId}
                  onChange={(e) => setFormPrestadorId(e.target.value)}
                >
                  {prestadores.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-texto_secundario uppercase mb-1.5">
                  Nome do Produto *
                </label>
                <input
                  type="text"
                  required
                  className="campo-base"
                  placeholder="Ex: Cera Matte Efeito Seco"
                  value={formNome}
                  onChange={(e) => setFormNome(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-texto_secundario uppercase mb-1.5">
                  Descrição
                </label>
                <textarea
                  className="campo-base resize-none h-16"
                  placeholder="Ex: Alta fixação para cabelos curtos..."
                  value={formDescricao}
                  onChange={(e) => setFormDescricao(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-texto_secundario uppercase mb-1.5 flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5" />
                    Preço (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    className="campo-base"
                    placeholder="49.90"
                    value={formPreco}
                    onChange={(e) => setFormPreco(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-texto_secundario uppercase mb-1.5 flex items-center gap-1">
                    <Package className="w-3.5 h-3.5" />
                    Estoque Físico *
                  </label>
                  <input
                    type="number"
                    required
                    className="campo-base"
                    placeholder="10"
                    value={formEstoque}
                    onChange={(e) => setFormEstoque(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-texto_secundario uppercase mb-1.5 flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" />
                    Categoria
                  </label>
                  <select
                    className="campo-base"
                    value={formCategoria}
                    onChange={(e) => setFormCategoria(e.target.value)}
                  >
                    {CATEGORIAS.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-texto_secundario uppercase mb-1.5 flex items-center gap-1">
                    <ImageIcon className="w-3.5 h-3.5" />
                    Imagem do Produto
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={enviandoImagem}
                    className="block w-full text-xs text-texto_secundario file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-verde_petroleo file:text-off_white hover:file:bg-verde_escuro cursor-pointer"
                    onChange={uploadImagem}
                  />
                  {enviandoImagem && <p className="text-[10px] text-dourado animate-pulse mt-0.5">Enviando imagem...</p>}
                </div>
              </div>

              {formImagemUrl && (
                <div className="flex items-center gap-3 p-2 bg-bege_borda/10 rounded-lg border border-bege_borda/40">
                  <img src={formImagemUrl} alt="Preview" className="w-8 h-8 object-cover rounded" />
                  <span className="text-[10px] text-texto_secundario truncate flex-1">{formImagemUrl}</span>
                  <button type="button" onClick={() => setFormImagemUrl("")} className="text-rose-600 hover:text-rose-800">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="ativo"
                  className="w-4 h-4 accent-verde_petroleo"
                  checked={formAtivo}
                  onChange={(e) => setFormAtivo(e.target.checked)}
                />
                <label htmlFor="ativo" className="text-sm font-medium text-texto_principal select-none cursor-pointer">
                  Disponível para venda no e-commerce
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t border-bege_borda mt-6">
                <button
                  type="button"
                  onClick={() => setModalAberto(false)}
                  className="botao-secundario flex-1 py-2 text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvando || enviandoImagem}
                  className="botao-primario flex-1 py-2 text-sm"
                >
                  {salvando ? "Salvando..." : "Salvar Produto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
