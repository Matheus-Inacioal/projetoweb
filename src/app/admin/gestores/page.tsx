"use client";

import { useState, useEffect } from "react";
import { criarClienteSupabaseNavegador } from "@/lib/banco/supabase-client";
import { EstadoCarregando } from "@/componentes/feedback/EstadoCarregando";
import { Search, Plus, Edit, Trash2, X, ShieldAlert, Store, UserCheck, Mail, Phone, Lock } from "lucide-react";
import toast from "react-hot-toast";

interface Gestor {
  id: string;
  usuario_id: string;
  loja_id: string;
  usuarios: {
    nome: string;
    email: string;
    telefone: string | null;
  } | null;
  lojas: {
    nome: string;
  } | null;
}

interface LojaDropdown {
  id: string;
  nome: string;
}

export default function GestoresAdminPage() {
  const [gestores, setGestores] = useState<Gestor[]>([]);
  const [lojas, setLojas] = useState<LojaDropdown[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroLoja, setFiltroLoja] = useState("todos");

  // Modal State
  const [modalAberto, setModalAberto] = useState(false);
  const [gestorEditando, setGestorEditando] = useState<Gestor | null>(null);

  // Form State
  const [formNome, setFormNome] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formSenha, setFormSenha] = useState("");
  const [formTelefone, setFormTelefone] = useState("");
  const [formLojaId, setFormLojaId] = useState("");
  const [salvando, setSalvando] = useState(false);

  const supabase = criarClienteSupabaseNavegador();

  const carregarDados = async () => {
    try {
      setCarregando(true);

      // Carregar Lojas para Dropdown
      const { data: lojasData, error: lojasError } = await supabase
        .from("lojas")
        .select("id, nome")
        .eq("ativo", true)
        .order("nome");
      if (lojasError) throw lojasError;
      setLojas(lojasData || []);

      // Carregar Gestores
      const { data: gestoresData, error: gestoresError } = await supabase
        .from("gestores")
        .select("*, usuarios(nome, email, telefone), lojas(nome)")
        .order("created_at", { ascending: false } as any); // cast because created_at is default on all tables
      
      if (gestoresError) throw gestoresError;
      setGestores(gestoresData || []);
    } catch (err: any) {
      toast.error("Erro ao carregar dados: " + err.message);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const abrirCriacao = () => {
    setGestorEditando(null);
    setFormNome("");
    setFormEmail("");
    setFormSenha("");
    setFormTelefone("");
    setFormLojaId(lojas[0]?.id || "");
    setModalAberto(true);
  };

  const abrirEdicao = (gestor: Gestor) => {
    setGestorEditando(gestor);
    setFormNome(gestor.usuarios?.nome || "");
    setFormEmail(gestor.usuarios?.email || "");
    setFormSenha(""); // Não mostra senha em edição
    setFormTelefone(gestor.usuarios?.telefone || "");
    setFormLojaId(gestor.loja_id);
    setModalAberto(true);
  };

  const excluirGestor = async (id: string, usuarioId: string) => {
    if (!confirm("Tem certeza que deseja remover este gestor? O acesso dele ao painel da loja será cancelado, mas a conta dele continuará no sistema.")) return;

    try {
      // Exclui a associação na tabela gestores
      const { error } = await supabase
        .from("gestores")
        .delete()
        .eq("id", id);

      if (error) throw error;

      // Também muda o tipo_usuario de volta para consumidor
      const { error: userError } = await supabase
        .from("usuarios")
        .update({ tipo_usuario: "consumidor" })
        .eq("id", usuarioId);

      if (userError) throw userError;

      toast.success("Gestor removido com sucesso! O usuário foi rebaixado a Consumidor.");
      carregarDados();
    } catch (err: any) {
      toast.error("Erro ao remover gestor: " + err.message);
    }
  };

  const salvarGestor = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formLojaId) {
      toast.error("Selecione uma loja para o gestor.");
      return;
    }

    try {
      setSalvando(true);

      if (gestorEditando) {
        // Atualizar associação de loja do gestor
        const { error } = await supabase
          .from("gestores")
          .update({ loja_id: formLojaId })
          .eq("id", gestorEditando.id);

        if (error) throw error;

        // Atualiza nome e telefone na tabela usuarios
        const { error: userError } = await supabase
          .from("usuarios")
          .update({ nome: formNome, telefone: formTelefone || null })
          .eq("id", gestorEditando.usuario_id);

        if (userError) throw userError;

        toast.success("Gestor atualizado com sucesso!");
        setModalAberto(false);
        carregarDados();
      } else {
        // Criar novo gestor
        if (!formEmail.trim() || !formSenha.trim()) {
          toast.error("E-mail e senha são obrigatórios para novos gestores.");
          setSalvando(false);
          return;
        }

        // 1. Cadastra a conta do usuário pelo endpoint de cadastro geral, passando loja_id na metadata
        const resposta = await fetch("/api/autenticacao/cadastro", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email: formEmail,
            senha: formSenha,
            nome: formNome,
            telefone: formTelefone || null,
            tipo: "gestor_loja",
            loja_id: formLojaId
          })
        });

        const resultado = await resposta.json();

        if (!resposta.ok || !resultado.sucesso) {
          throw new Error(resultado.mensagem || "Erro ao criar conta de gestor.");
        }

        toast.success("Gestor cadastrado e associado com sucesso!");
        setModalAberto(false);
        carregarDados();
      }
    } catch (err: any) {
      toast.error(err.message || "Erro ao salvar gestor.");
    } finally {
      setSalvando(false);
    }
  };

  const gestoresFiltrados = gestores.filter(g => {
    const correspondeBusca = 
      (g.usuarios?.nome || "").toLowerCase().includes(busca.toLowerCase()) ||
      (g.usuarios?.email || "").toLowerCase().includes(busca.toLowerCase());

    const correspondeLoja = 
      filtroLoja === "todos" || g.loja_id === filtroLoja;

    return correspondeBusca && correspondeLoja;
  });

  if (carregando) return <EstadoCarregando texto="Carregando gestores..." />;

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-serif text-verde_petroleo flex items-center gap-2">
            <UserCheck className="w-8 h-8 text-dourado" />
            Gestores de Lojas
          </h1>
          <p className="text-texto_secundario mt-1">
            Controle e delegue acessos administrativos a gestores de cada estabelecimento do marketplace.
          </p>
        </div>
        <button
          onClick={abrirCriacao}
          className="botao-primario self-start flex items-center gap-2 bg-verde_petroleo hover:bg-verde_escuro text-marfim px-4 py-2.5 rounded-lg font-medium transition-all"
        >
          <Plus className="w-5 h-5" />
          Cadastrar Novo Gestor
        </button>
      </div>

      {/* Filtros e Busca */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-marfim p-4 rounded-xl border border-bege_borda/50 shadow-suave">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-texto_secundario" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome ou e-mail do gestor..."
            className="w-full pl-10 pr-4 py-2.5 bg-off_white border border-bege_borda rounded-lg focus:outline-none focus:border-dourado text-sm transition-all"
          />
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-sm font-medium text-texto_secundario whitespace-nowrap">Filtrar por Loja:</span>
          <select
            value={filtroLoja}
            onChange={(e) => setFiltroLoja(e.target.value)}
            className="w-full sm:w-48 px-3 py-2.5 bg-off_white border border-bege_borda rounded-lg text-sm focus:outline-none focus:border-dourado"
          >
            <option value="todos">Todas</option>
            {lojas.map(loja => (
              <option key={loja.id} value={loja.id}>{loja.nome}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabela de Gestores */}
      {gestoresFiltrados.length === 0 ? (
        <div className="text-center py-16 bg-marfim rounded-2xl border border-bege_borda/50 shadow-suave">
          <UserCheck className="w-16 h-16 text-texto_secundario/40 mx-auto mb-4" />
          <h3 className="text-lg font-serif font-bold text-verde_petroleo">Nenhum gestor encontrado</h3>
          <p className="text-texto_secundario mt-1">Cadastre um novo gestor para iniciar.</p>
        </div>
      ) : (
        <div className="bg-marfim rounded-2xl border border-bege_borda/50 shadow-suave overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-off_white border-b border-bege_borda/40 text-verde_escuro font-serif text-sm">
                  <th className="p-4 font-bold">Gestor</th>
                  <th className="p-4 font-bold">E-mail / Telefone</th>
                  <th className="p-4 font-bold">Loja Responsável</th>
                  <th className="p-4 font-bold text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-bege_borda/20 text-sm">
                {gestoresFiltrados.map((g) => (
                  <tr key={g.id} className="hover:bg-off_white/50 transition-colors">
                    <td className="p-4">
                      <div className="font-semibold text-verde_petroleo">{g.usuarios?.nome || "Sem Nome"}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-0.5 text-texto_secundario text-xs">
                        <div className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 text-dourado" />
                          {g.usuarios?.email}
                        </div>
                        {g.usuarios?.telefone && (
                          <div className="flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-dourado" />
                            {g.usuarios.telefone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 font-medium text-verde_escuro">
                        <Store className="w-4 h-4 text-dourado shrink-0" />
                        {g.lojas?.nome || "Sem Loja Cadastrada"}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => abrirEdicao(g)}
                          title="Editar Gestor"
                          className="p-1.5 hover:bg-verde_petroleo/10 rounded-lg text-verde_petroleo transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => excluirGestor(g.id, g.usuario_id)}
                          title="Remover Associação"
                          className="p-1.5 hover:bg-vermelho_coral/10 rounded-lg text-vermelho_coral transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Cadastro/Edição */}
      {modalAberto && (
        <div className="fixed inset-0 bg-verde_escuro/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-marfim rounded-2xl max-w-md w-full border border-bege_borda shadow-premium animate-fade-in">
            {/* Header Modal */}
            <div className="p-6 border-b border-bege_borda/30 flex items-center justify-between">
              <h2 className="text-xl font-serif font-bold text-verde_petroleo flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-dourado" />
                {gestorEditando ? "Editar Gestor" : "Cadastrar Novo Gestor"}
              </h2>
              <button
                onClick={() => setModalAberto(false)}
                className="p-2 hover:bg-off_white rounded-full text-texto_secundario transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={salvarGestor} className="p-6 space-y-4">
              {/* Nome */}
              <div>
                <label className="block text-xs font-semibold text-verde_escuro uppercase tracking-wider mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  value={formNome}
                  onChange={(e) => setFormNome(e.target.value)}
                  required
                  placeholder="Nome do gestor"
                  className="w-full px-3 py-2 border border-bege_borda rounded-lg text-sm bg-off_white focus:outline-none focus:border-dourado"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-verde_escuro uppercase tracking-wider mb-1">
                  E-mail *
                </label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  required
                  disabled={!!gestorEditando}
                  placeholder="gestor@barbearia.com"
                  className="w-full px-3 py-2 border border-bege_borda rounded-lg text-sm bg-off_white focus:outline-none focus:border-dourado disabled:opacity-50"
                />
              </div>

              {/* Senha (só para novos) */}
              {!gestorEditando && (
                <div>
                  <label className="block text-xs font-semibold text-verde_escuro uppercase tracking-wider mb-1">
                    Senha de Acesso *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-texto_secundario" />
                    <input
                      type="password"
                      value={formSenha}
                      onChange={(e) => setFormSenha(e.target.value)}
                      required
                      placeholder="Mínimo 6 caracteres"
                      className="w-full pl-9 pr-3 py-2 border border-bege_borda rounded-lg text-sm bg-off_white focus:outline-none focus:border-dourado"
                    />
                  </div>
                </div>
              )}

              {/* Telefone */}
              <div>
                <label className="block text-xs font-semibold text-verde_escuro uppercase tracking-wider mb-1">
                  Telefone
                </label>
                <input
                  type="text"
                  value={formTelefone}
                  onChange={(e) => setFormTelefone(e.target.value)}
                  placeholder="(11) 98888-8888"
                  className="w-full px-3 py-2 border border-bege_borda rounded-lg text-sm bg-off_white focus:outline-none focus:border-dourado"
                />
              </div>

              {/* Loja Associada */}
              <div>
                <label className="block text-xs font-semibold text-verde_escuro uppercase tracking-wider mb-1">
                  Barbearia / Loja Responsável *
                </label>
                <select
                  value={formLojaId}
                  onChange={(e) => setFormLojaId(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-bege_borda rounded-lg text-sm bg-off_white focus:outline-none focus:border-dourado text-verde_escuro font-medium"
                >
                  <option value="" disabled>Selecione uma loja...</option>
                  {lojas.map((loja) => (
                    <option key={loja.id} value={loja.id}>
                      {loja.nome}
                    </option>
                  ))}
                </select>
                {lojas.length === 0 && (
                  <p className="text-xs text-vermelho_coral mt-1 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    Nenhuma loja ativa cadastrada no sistema. Cadastre uma loja primeiro!
                  </p>
                )}
              </div>

              {/* Botões Ação */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-bege_borda/30">
                <button
                  type="button"
                  onClick={() => setModalAberto(false)}
                  className="px-4 py-2 border border-bege_borda hover:bg-off_white rounded-lg text-xs font-semibold text-texto_secundario transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvando || lojas.length === 0}
                  className="px-4 py-2 bg-verde_petroleo hover:bg-verde_escuro disabled:bg-verde_petroleo/50 text-marfim rounded-lg text-xs font-semibold transition-all"
                >
                  {salvando ? "Salvando..." : "Salvar Gestor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
