"use client";

import { useState, useEffect } from "react";
import { criarClienteSupabaseNavegador } from "@/lib/banco/supabase-client";
import { EstadoCarregando } from "@/componentes/feedback/EstadoCarregando";
import { Search, Plus, Edit, Trash2, X, Megaphone, Image as ImageIcon } from "lucide-react";
import toast from "react-hot-toast";

interface Anuncio {
  id: string;
  prestador_id: string;
  titulo: string;
  descricao: string;
  imagem_url: string | null;
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

export default function AnunciosAdminPage() {
  const [anuncios, setAnuncios] = useState<Anuncio[]>([]);
  const [prestadores, setPrestadores] = useState<PrestadorDropdown[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");

  // CRUD states
  const [modalAberto, setModalAberto] = useState(false);
  const [anuncioEditando, setAnuncioEditando] = useState<Anuncio | null>(null);
  const [formPrestadorId, setFormPrestadorId] = useState("");
  const [formTitulo, setFormTitulo] = useState("");
  const [formDescricao, setFormDescricao] = useState("");
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
          nome: p.usuarios?.nome || "Prestador"
        }))
      );

      // Carrega anuncios
      const { data: aData, error: aErr } = await supabase
        .from("anuncios")
        .select("*, prestadores(usuarios(nome))")
        .order("created_at", { ascending: false });
      if (aErr) throw aErr;
      
      setAnuncios((aData as any) || []);
    } catch (err: any) {
      toast.error("Erro ao carregar anúncios: " + err.message);
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
      const filePath = `anuncios/${fileName}`;

      // Upload directly to Supabase storage bucket "anuncios"
      const { error: uploadError } = await supabase.storage
        .from("anuncios")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("anuncios")
        .getPublicUrl(filePath);

      setFormImagemUrl(publicUrl);
      toast.success("Banner enviado!");
    } catch (err: any) {
      toast.error("Erro no upload da imagem: " + err.message);
    } finally {
      setEnviandoImagem(false);
    }
  };

  const abrirNovo = () => {
    setAnuncioEditando(null);
    setFormPrestadorId(prestadores[0]?.id || "");
    setFormTitulo("");
    setFormDescricao("");
    setFormImagemUrl("");
    setFormAtivo(true);
    setModalAberto(true);
  };

  const abrirEdicao = (a: Anuncio) => {
    setAnuncioEditando(a);
    setFormPrestadorId(a.prestador_id);
    setFormTitulo(a.titulo);
    setFormDescricao(a.descricao);
    setFormImagemUrl(a.imagem_url || "");
    setFormAtivo(a.ativo);
    setModalAberto(true);
  };

  const salvarAnuncio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitulo || !formDescricao) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }

    try {
      setSalvando(true);
      const payload = {
        prestador_id: formPrestadorId,
        titulo: formTitulo,
        descricao: formDescricao,
        imagem_url: formImagemUrl || null,
        ativo: formAtivo
      };

      if (anuncioEditando) {
        const { error } = await supabase
          .from("anuncios")
          .update(payload)
          .eq("id", anuncioEditando.id);
        if (error) throw error;
        toast.success("Anúncio atualizado com sucesso!");
      } else {
        const { error } = await supabase
          .from("anuncios")
          .insert(payload);
        if (error) throw error;
        toast.success("Anúncio criado com sucesso!");
      }

      setModalAberto(false);
      carregarDados();
    } catch (err: any) {
      toast.error("Erro ao salvar anúncio: " + err.message);
    } finally {
      setSalvando(false);
    }
  };

  const excluirAnuncio = async (id: string) => {
    if (!confirm("Tem certeza que deseja remover este anúncio permanentemente?")) return;
    try {
      const { error } = await supabase
        .from("anuncios")
        .delete()
        .eq("id", id);
      if (error) throw error;

      setAnuncios(anuncios.filter(a => a.id !== id));
      toast.success("Anúncio excluído!");
    } catch (err: any) {
      toast.error("Erro ao excluir: " + err.message);
    }
  };

  const filtrados = anuncios.filter(a => {
    const titulo = a.titulo || "";
    const prestador = a.prestadores?.usuarios?.nome || "";
    return (
      titulo.toLowerCase().includes(busca.toLowerCase()) ||
      prestador.toLowerCase().includes(busca.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="texto-destaque mb-1">Módulos de Controle</p>
          <h1 className="text-3xl font-serif font-bold text-verde_petroleo">Campanhas & Anúncios</h1>
          <p className="text-sm text-texto_secundario">Gerencie os banners e anúncios promocionais visíveis na página inicial dos clientes.</p>
        </div>
        <button
          onClick={abrirNovo}
          className="botao-premium flex items-center justify-center gap-1.5 self-start py-2.5 px-4 font-bold"
        >
          <Plus className="w-5 h-5" />
          Novo Anúncio
        </button>
      </div>

      {/* Barra de Pesquisa */}
      <div className="relative w-full bg-off_white p-4 rounded-xl border border-bege_borda shadow-suave">
        <Search className="absolute left-7 top-1/2 -translate-y-1/2 w-4 h-4 text-texto_secundario" />
        <input
          type="text"
          placeholder="Buscar anúncio por título ou barbeiro anunciante..."
          className="campo-base pl-10"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      {/* Grid de Anúncios */}
      {carregando ? (
        <EstadoCarregando texto="Buscando anúncios ativos..." />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtrados.length === 0 ? (
            <div className="col-span-full cartao p-8 text-center text-texto_secundario font-medium">
              Nenhum anúncio correspondente encontrado.
            </div>
          ) : (
            filtrados.map((a) => (
              <div key={a.id} className="cartao overflow-hidden flex flex-col justify-between">
                {a.imagem_url ? (
                  <img
                    src={a.imagem_url}
                    alt={a.titulo}
                    className="w-full h-44 object-cover border-b border-bege_borda bg-marfim"
                  />
                ) : (
                  <div className="w-full h-44 bg-verde_petroleo/5 flex items-center justify-center border-b border-bege_borda text-texto_secundario">
                    <ImageIcon className="w-10 h-10" />
                  </div>
                )}
                
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${
                        a.ativo ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                      }`}>
                        {a.ativo ? "Veiculando" : "Pausado"}
                      </span>
                      <span className="text-[10px] text-texto_secundario font-medium uppercase">
                        Loja: {a.prestadores?.usuarios?.nome || "Barbearia"}
                      </span>
                    </div>
                    <h3 className="font-serif font-bold text-verde_petroleo text-lg leading-tight">
                      {a.titulo}
                    </h3>
                    <p className="text-xs text-texto_secundario leading-relaxed line-clamp-3">
                      {a.descricao}
                    </p>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => abrirEdicao(a)}
                      className="botao-secundario flex-1 py-1.5 text-xs flex items-center justify-center gap-1"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      Editar
                    </button>
                    <button
                      onClick={() => excluirAnuncio(a.id)}
                      className="botao-perigo flex-1 py-1.5 text-xs flex items-center justify-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Remover
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal CRUD Form */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-off_white rounded-2xl border border-bege_borda shadow-premium w-full max-w-md p-6 relative">
            <button
              onClick={() => setModalAberto(false)}
              className="absolute right-4 top-4 p-1 hover:bg-bege_borda/20 rounded-full text-texto_secundario transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-serif font-bold text-verde_petroleo mb-6 flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-dourado" />
              {anuncioEditando ? "Editar Anúncio" : "Novo Anúncio"}
            </h2>

            <form onSubmit={salvarAnuncio} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-texto_secundario uppercase mb-1.5">
                  Anunciante (Barbeiro) *
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
                  Título do Anúncio *
                </label>
                <input
                  type="text"
                  required
                  className="campo-base"
                  placeholder="Ex: Combo de Inauguração / 20% OFF"
                  value={formTitulo}
                  onChange={(e) => setFormTitulo(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-texto_secundario uppercase mb-1.5">
                  Descrição / Regulamento *
                </label>
                <textarea
                  required
                  className="campo-base resize-none h-20"
                  placeholder="Ex: Ganhe corte grátis na compra de 2 produtos..."
                  value={formDescricao}
                  onChange={(e) => setFormDescricao(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-texto_secundario uppercase mb-1.5 flex items-center gap-1">
                  <ImageIcon className="w-3.5 h-3.5" />
                  Imagem do Banner *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  disabled={enviandoImagem}
                  className="block w-full text-xs text-texto_secundario file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-verde_petroleo file:text-off_white hover:file:bg-verde_escuro cursor-pointer"
                  onChange={uploadImagem}
                />
                {enviandoImagem && <p className="text-[10px] text-dourado animate-pulse mt-0.5">Subindo banner...</p>}
              </div>

              {formImagemUrl && (
                <div className="flex items-center gap-3 p-2 bg-bege_borda/10 rounded-lg border border-bege_borda/40">
                  <img src={formImagemUrl} alt="Preview" className="w-12 h-8 object-cover rounded" />
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
                  Publicar banner imediatamente na Home
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
                  {salvando ? "Salvando..." : "Salvar Anúncio"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
