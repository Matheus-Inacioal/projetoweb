"use client";

import { useState, useEffect } from "react";
import { criarClienteSupabaseNavegador } from "@/lib/banco/supabase-client";
import { EstadoCarregando } from "@/componentes/feedback/EstadoCarregando";
import { Search, Star, Eye, Ban, CheckCircle, X, Scissors, ShoppingBag } from "lucide-react";
import toast from "react-hot-toast";

interface Prestador {
  id: string;
  usuario_id: string;
  descricao: string;
  especialidade: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  avaliacao_media: number;
  quantidade_avaliacoes: number;
  ativo: boolean;
  usuarios: {
    nome: string;
    email: string;
    telefone: string | null;
    foto_url: string | null;
  } | null;
}

interface Servico {
  id: string;
  nome: string;
  preco: number;
  duracao_minutos: number;
}

interface Produto {
  id: string;
  nome: string;
  preco: number;
  estoque: number;
}

export default function PrestadoresAdminPage() {
  const [prestadores, setPrestadores] = useState<Prestador[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");
  
  // Detail Modal state
  const [prestadorSelecionado, setPrestadorSelecionado] = useState<Prestador | null>(null);
  const [servicosPrestador, setServicosPrestador] = useState<Servico[]>([]);
  const [produtosPrestador, setProdutosPrestador] = useState<Produto[]>([]);
  const [carregandoDetalhes, setCarregandoDetalhes] = useState(false);

  const supabase = criarClienteSupabaseNavegador();

  const carregarPrestadores = async () => {
    try {
      setCarregando(true);
      const { data, error } = await supabase
        .from("prestadores")
        .select("*, usuarios(nome, email, telefone, foto_url)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPrestadores((data as any) || []);
    } catch (err: any) {
      toast.error("Erro ao carregar prestadores: " + err.message);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarPrestadores();
  }, []);

  const alternarAtivo = async (id: string, ativoAtual: boolean) => {
    try {
      const { error } = await supabase
        .from("prestadores")
        .update({ ativo: !ativoAtual })
        .eq("id", id);

      if (error) throw error;

      setPrestadores(prestadores.map(p => p.id === id ? { ...p, ativo: !ativoAtual } : p));
      if (prestadorSelecionado?.id === id) {
        setPrestadorSelecionado({ ...prestadorSelecionado, ativo: !ativoAtual });
      }
      toast.success(ativoAtual ? "Prestador bloqueado/inativado!" : "Prestador aprovado/ativado!");
    } catch (err: any) {
      toast.error("Erro ao alterar status: " + err.message);
    }
  };

  const visualizarDetalhes = async (prestador: Prestador) => {
    setPrestadorSelecionado(prestador);
    setCarregandoDetalhes(true);
    try {
      // Carrega servicos
      const { data: servicos, error: sErr } = await supabase
        .from("servicos")
        .select("id, nome, preco, duracao_minutos")
        .eq("prestador_id", prestador.id);
      
      if (sErr) throw sErr;
      setServicosPrestador(servicos || []);

      // Carrega produtos
      const { data: produtos, error: pErr } = await supabase
        .from("produtos")
        .select("id, nome, preco, estoque")
        .eq("prestador_id", prestador.id);

      if (pErr) throw pErr;
      setProdutosPrestador(produtos || []);
    } catch (err: any) {
      toast.error("Erro ao carregar serviços/produtos: " + err.message);
    } finally {
      setCarregandoDetalhes(false);
    }
  };

  const filtrados = prestadores.filter(p => {
    const nome = p.usuarios?.nome || "";
    const email = p.usuarios?.email || "";
    const especialidade = p.especialidade || "";
    const query = busca.toLowerCase();

    return (
      nome.toLowerCase().includes(query) ||
      email.toLowerCase().includes(query) ||
      especialidade.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div>
        <p className="texto-destaque mb-1">Módulos de Controle</p>
        <h1 className="text-3xl font-serif font-bold text-verde_petroleo">Gestão de Prestadores</h1>
        <p className="text-sm text-texto_secundario">Supervisione profissionais, gerencie especialidades e visualize carteira de serviços e produtos.</p>
      </div>

      {/* Barra de Pesquisa */}
      <div className="relative w-full bg-off_white p-4 rounded-xl border border-bege_borda shadow-suave">
        <Search className="absolute left-7 top-1/2 -translate-y-1/2 w-4 h-4 text-texto_secundario" />
        <input
          type="text"
          placeholder="Buscar prestador por nome, email ou especialidade..."
          className="campo-base pl-10"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      {/* Grid de Prestadores */}
      {carregando ? (
        <EstadoCarregando texto="Carregando lista de profissionais..." />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtrados.length === 0 ? (
            <div className="col-span-full cartao p-8 text-center text-texto_secundario font-medium">
              Nenhum profissional correspondente encontrado.
            </div>
          ) : (
            filtrados.map((p) => (
              <div key={p.id} className="cartao p-6 flex flex-col justify-between space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {p.usuarios?.foto_url ? (
                      <img
                        src={p.usuarios.foto_url}
                        alt={p.usuarios.nome}
                        className="w-12 h-12 rounded-full object-cover border border-bege_borda"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-verde_petroleo/10 text-verde_petroleo flex items-center justify-center font-bold text-lg font-serif">
                        {p.usuarios?.nome.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h3 className="font-serif font-bold text-verde_petroleo text-lg leading-tight">
                        {p.usuarios?.nome}
                      </h3>
                      <p className="text-xs text-dourado font-semibold uppercase mt-0.5">{p.especialidade || "Geral"}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    p.ativo ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                  }`}>
                    {p.ativo ? "Ativo" : "Bloqueado"}
                  </span>
                </div>

                <p className="text-sm text-texto_secundario line-clamp-2 italic h-10">
                  &quot;{p.descricao || "Sem descrição preenchida no perfil."}&quot;
                </p>

                <div className="flex items-center justify-between text-xs text-texto_secundario border-t border-bege_borda/50 pt-3">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-dourado text-dourado shrink-0" />
                    <span className="font-bold text-texto_principal">{p.avaliacao_media.toFixed(1)}</span>
                    <span>({p.quantidade_avaliacoes} avaliações)</span>
                  </div>
                  <span>{p.cidade} - {p.estado}</span>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => visualizarDetalhes(p)}
                    className="botao-secundario flex-1 py-2 text-xs flex items-center justify-center gap-1.5"
                  >
                    <Eye className="w-4 h-4" />
                    Ver Detalhes
                  </button>
                  <button
                    onClick={() => alternarAtivo(p.id, p.ativo)}
                    className={`botao-base flex-1 py-2 text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                      p.ativo 
                        ? "bg-rose-100 hover:bg-rose-200 text-rose-700" 
                        : "bg-emerald-100 hover:bg-emerald-200 text-emerald-700"
                    }`}
                  >
                    {p.ativo ? (
                      <>
                        <Ban className="w-4 h-4" />
                        Bloquear
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Aprovar
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal de Detalhes Completo */}
      {prestadorSelecionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-off_white rounded-2xl border border-bege_borda shadow-premium w-full max-w-2xl p-6 relative max-h-[90vh] flex flex-col">
            <button
              onClick={() => setPrestadorSelecionado(null)}
              className="absolute right-4 top-4 p-1 hover:bg-bege_borda/20 rounded-full text-texto_secundario transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Cabeçalho do Profissional */}
            <div className="flex items-start gap-4 pb-6 border-b border-bege_borda">
              {prestadorSelecionado.usuarios?.foto_url ? (
                <img
                  src={prestadorSelecionado.usuarios.foto_url}
                  alt={prestadorSelecionado.usuarios.nome}
                  className="w-16 h-16 rounded-full object-cover border border-bege_borda"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-verde_petroleo/10 text-verde_petroleo flex items-center justify-center font-bold text-2xl font-serif">
                  {prestadorSelecionado.usuarios?.nome.charAt(0)}
                </div>
              )}
              <div className="space-y-1">
                <h2 className="text-2xl font-serif font-bold text-verde_petroleo">
                  {prestadorSelecionado.usuarios?.nome}
                </h2>
                <p className="text-sm font-semibold uppercase tracking-wider text-dourado">{prestadorSelecionado.especialidade}</p>
                <div className="text-xs text-texto_secundario flex flex-wrap gap-x-4 gap-y-1">
                  <span>Email: {prestadorSelecionado.usuarios?.email}</span>
                  <span>Tel: {prestadorSelecionado.usuarios?.telefone || "Não cadastrado"}</span>
                  <span>CEP: {prestadorSelecionado.cep}</span>
                </div>
              </div>
            </div>

            {/* Conteúdo com Scroll */}
            <div className="flex-1 overflow-y-auto py-6 space-y-6">
              {/* Descrição */}
              <div>
                <h3 className="text-xs font-semibold text-texto_secundario uppercase tracking-wider mb-2">Histórico & Descrição</h3>
                <p className="text-sm text-texto_principal leading-relaxed bg-bege_borda/10 p-4 rounded-xl border border-bege_borda/40">
                  {prestadorSelecionado.descricao || "Nenhuma descrição detalhada informada."}
                </p>
              </div>

              {/* Endereço */}
              <div>
                <h3 className="text-xs font-semibold text-texto_secundario uppercase tracking-wider mb-2">Endereço de Atendimento</h3>
                <p className="text-sm text-texto_principal">
                  {prestadorSelecionado.endereco} — {prestadorSelecionado.cidade} - {prestadorSelecionado.estado}
                </p>
              </div>

              {/* Serviços Vinculados */}
              <div>
                <h3 className="text-sm font-serif font-bold text-verde_petroleo mb-3 flex items-center gap-2">
                  <Scissors className="w-4 h-4 text-dourado" />
                  Serviços Disponibilizados ({servicosPrestador.length})
                </h3>
                {carregandoDetalhes ? (
                  <p className="text-xs text-texto_secundario">Carregando catálogo...</p>
                ) : servicosPrestador.length === 0 ? (
                  <p className="text-xs text-texto_secundario italic">Este prestador não tem nenhum serviço cadastrado.</p>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {servicosPrestador.map(s => (
                      <div key={s.id} className="p-3 bg-off_white border border-bege_borda rounded-lg flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-sm text-verde_petroleo">{s.nome}</p>
                          <p className="text-xs text-texto_secundario">Duração: {s.duracao_minutos} min</p>
                        </div>
                        <span className="font-serif font-bold text-verde_escuro text-sm">
                          R$ {Number(s.preco).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Produtos Vinculados */}
              <div>
                <h3 className="text-sm font-serif font-bold text-verde_petroleo mb-3 flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-dourado" />
                  Produtos à Venda ({produtosPrestador.length})
                </h3>
                {carregandoDetalhes ? (
                  <p className="text-xs text-texto_secundario">Carregando estoque...</p>
                ) : produtosPrestador.length === 0 ? (
                  <p className="text-xs text-texto_secundario italic">Este prestador não tem nenhum produto cadastrado.</p>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {produtosPrestador.map(p => (
                      <div key={p.id} className="p-3 bg-off_white border border-bege_borda rounded-lg flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-sm text-verde_petroleo">{p.nome}</p>
                          <p className="text-xs text-texto_secundario">Estoque: <span className={p.estoque > 0 ? "text-verde_escuro font-bold" : "text-rose-600 font-bold"}>{p.estoque} un</span></p>
                        </div>
                        <span className="font-serif font-bold text-verde_escuro text-sm">
                          R$ {Number(p.preco).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Rodapé do Modal */}
            <div className="border-t border-bege_borda pt-4 flex gap-3">
              <button
                onClick={() => setPrestadorSelecionado(null)}
                className="botao-secundario flex-1 py-2 text-sm"
              >
                Voltar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
