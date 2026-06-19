"use client";

import { useState, useEffect } from "react";
import { criarClienteSupabaseNavegador } from "@/lib/banco/supabase-client";
import { EstadoCarregando } from "@/componentes/feedback/EstadoCarregando";
import { Search, Plus, Edit, Trash2, X, Scissors, Clock, DollarSign, User } from "lucide-react";
import toast from "react-hot-toast";

interface Servico {
  id: string;
  prestador_id: string;
  nome: string;
  descricao: string;
  preco: number;
  duracao_minutos: number;
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

export default function ServicosAdminPage() {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [prestadores, setPrestadores] = useState<PrestadorDropdown[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");

  // Form Modal state
  const [modalAberto, setModalAberto] = useState(false);
  const [servicoEditando, setServicoEditando] = useState<Servico | null>(null);
  const [formPrestadorId, setFormPrestadorId] = useState("");
  const [formNome, setFormNome] = useState("");
  const [formDescricao, setFormDescricao] = useState("");
  const [formPreco, setFormPreco] = useState("");
  const [formDuracao, setFormDuracao] = useState("30");
  const [formAtivo, setFormAtivo] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const supabase = criarClienteSupabaseNavegador();

  const carregarDados = async () => {
    try {
      setCarregando(true);
      
      // Carrega prestadores para dropdown
      const { data: pData, error: pErr } = await supabase
        .from("prestadores")
        .select("id, usuarios(nome)");
      if (pErr) throw pErr;
      
      setPrestadores(
        (pData || []).map((p: any) => ({
          id: p.id,
          nome: p.usuarios?.nome || "Barbeiro Sem Nome"
        }))
      );

      // Carrega servicos
      const { data: sData, error: sErr } = await supabase
        .from("servicos")
        .select("*, prestadores(usuarios(nome))")
        .order("created_at", { ascending: false });
      if (sErr) throw sErr;
      
      setServicos((sData as any) || []);
    } catch (err: any) {
      toast.error("Erro ao carregar dados: " + err.message);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const abrirNovo = () => {
    setServicoEditando(null);
    setFormPrestadorId(prestadores[0]?.id || "");
    setFormNome("");
    setFormDescricao("");
    setFormPreco("");
    setFormDuracao("30");
    setFormAtivo(true);
    setModalAberto(true);
  };

  const abrirEdicao = (s: Servico) => {
    setServicoEditando(s);
    setFormPrestadorId(s.prestador_id);
    setFormNome(s.nome);
    setFormDescricao(s.descricao);
    setFormPreco(String(s.preco));
    setFormDuracao(String(s.duracao_minutos));
    setFormAtivo(s.ativo);
    setModalAberto(true);
  };

  const salvarServico = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNome || !formPreco || !formDuracao) {
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
        duracao_minutos: parseInt(formDuracao),
        ativo: formAtivo
      };

      if (servicoEditando) {
        // UPDATE
        const { error } = await supabase
          .from("servicos")
          .update(payload)
          .eq("id", servicoEditando.id);
        if (error) throw error;
        toast.success("Serviço atualizado!");
      } else {
        // INSERT
        const { error } = await supabase
          .from("servicos")
          .insert(payload);
        if (error) throw error;
        toast.success("Serviço criado com sucesso!");
      }

      setModalAberto(false);
      carregarDados(); // Recarrega a tabela
    } catch (err: any) {
      toast.error("Erro ao salvar: " + err.message);
    } finally {
      setSalvando(false);
    }
  };

  const excluirServico = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir permanentemente este serviço?")) return;

    try {
      const { error } = await supabase
        .from("servicos")
        .delete()
        .eq("id", id);
      if (error) throw error;

      setServicos(servicos.filter(s => s.id !== id));
      toast.success("Serviço removido com sucesso!");
    } catch (err: any) {
      toast.error("Erro ao excluir serviço: " + err.message);
    }
  };

  const filtrados = servicos.filter(s => {
    const nome = s.nome || "";
    const prestador = s.prestadores?.usuarios?.nome || "";
    const query = busca.toLowerCase();

    return nome.toLowerCase().includes(query) || prestador.toLowerCase().includes(query);
  });

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="texto-destaque mb-1">Módulos de Controle</p>
          <h1 className="text-3xl font-serif font-bold text-verde_petroleo">Catálogo de Serviços</h1>
          <p className="text-sm text-texto_secundario">Gerencie cortes, barbas, designs de sobrancelha e pacotes promocionais.</p>
        </div>
        <button
          onClick={abrirNovo}
          className="botao-premium flex items-center justify-center gap-1.5 self-start py-2.5 px-4 font-bold"
        >
          <Plus className="w-5 h-5" />
          Novo Serviço
        </button>
      </div>

      {/* Barra de Busca */}
      <div className="relative w-full bg-off_white p-4 rounded-xl border border-bege_borda shadow-suave">
        <Search className="absolute left-7 top-1/2 -translate-y-1/2 w-4 h-4 text-texto_secundario" />
        <input
          type="text"
          placeholder="Buscar serviço pelo nome ou barbeiro prestador..."
          className="campo-base pl-10"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      {/* Lista de Serviços */}
      {carregando ? (
        <EstadoCarregando texto="Carregando catálogo..." />
      ) : (
        <div className="cartao overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-verde_petroleo/5 border-b border-bege_borda text-xs font-semibold text-verde_petroleo uppercase tracking-wider">
                <th className="p-4">Serviço</th>
                <th className="p-4">Barbeiro / Prestador</th>
                <th className="p-4">Duração</th>
                <th className="p-4">Preço</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bege_borda text-sm text-texto_principal">
              {filtrados.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-texto_secundario font-medium">
                    Nenhum serviço correspondente encontrado.
                  </td>
                </tr>
              ) : (
                filtrados.map((s) => (
                  <tr key={s.id} className="hover:bg-bege_borda/10 transition">
                    <td className="p-4">
                      <div>
                        <p className="font-semibold text-verde_petroleo">{s.nome}</p>
                        {s.descricao && <p className="text-xs text-texto_secundario line-clamp-1">{s.descricao}</p>}
                      </div>
                    </td>
                    <td className="p-4 text-texto_secundario font-medium">
                      {s.prestadores?.usuarios?.nome || "Não atribuído"}
                    </td>
                    <td className="p-4 text-texto_secundario flex items-center gap-1 mt-1">
                      <Clock className="w-4 h-4 text-texto_secundario" />
                      <span>{s.duracao_minutos} min</span>
                    </td>
                    <td className="p-4 font-serif font-bold text-verde_escuro">
                      R$ {Number(s.preco).toFixed(2)}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        s.ativo ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                      }`}>
                        {s.ativo ? "Ativo" : "Pausado"}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => abrirEdicao(s)}
                          className="p-1.5 text-texto_secundario hover:text-dourado hover:bg-dourado/10 rounded transition"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => excluirServico(s.id)}
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
              <Scissors className="w-5 h-5 text-dourado" />
              {servicoEditando ? "Editar Serviço" : "Novo Serviço"}
            </h2>

            <form onSubmit={salvarServico} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-texto_secundario uppercase mb-1.5 flex items-center gap-1">
                  <User className="w-3.5 h-3.5" />
                  Barbeiro Prestador *
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
                  Nome do Serviço *
                </label>
                <input
                  type="text"
                  required
                  className="campo-base"
                  placeholder="Ex: Degradê Completo, Barba na Navalha"
                  value={formNome}
                  onChange={(e) => setFormNome(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-texto_secundario uppercase mb-1.5">
                  Descrição
                </label>
                <textarea
                  className="campo-base resize-none h-20"
                  placeholder="Ex: Corte com acabamento na navalha, lavagem inclusa..."
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
                    placeholder="40.00"
                    value={formPreco}
                    onChange={(e) => setFormPreco(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-texto_secundario uppercase mb-1.5 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Duração (Min) *
                  </label>
                  <select
                    required
                    className="campo-base"
                    value={formDuracao}
                    onChange={(e) => setFormDuracao(e.target.value)}
                  >
                    <option value="15">15 min</option>
                    <option value="20">20 min</option>
                    <option value="30">30 min</option>
                    <option value="40">40 min</option>
                    <option value="45">45 min</option>
                    <option value="60">60 min</option>
                    <option value="90">90 min</option>
                    <option value="120">120 min</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="ativo"
                  className="w-4 h-4 accent-verde_petroleo"
                  checked={formAtivo}
                  onChange={(e) => setFormAtivo(e.target.checked)}
                />
                <label htmlFor="ativo" className="text-sm font-medium text-texto_principal select-none cursor-pointer">
                  Disponível para agendamento no marketplace
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
                  disabled={salvando}
                  className="botao-primario flex-1 py-2 text-sm"
                >
                  {salvando ? "Salvando..." : "Salvar Serviço"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
