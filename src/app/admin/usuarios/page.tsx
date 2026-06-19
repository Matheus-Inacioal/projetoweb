"use client";

import { useState, useEffect } from "react";
import { criarClienteSupabaseNavegador } from "@/lib/banco/supabase-client";
import { EstadoCarregando } from "@/componentes/feedback/EstadoCarregando";
import { Search, Filter, Edit, UserCheck, UserMinus, Plus, X } from "lucide-react";
import toast from "react-hot-toast";
import { clsx } from "clsx";

interface Usuario {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
  tipo_usuario: "admin" | "prestador" | "consumidor";
  ativo: boolean;
  created_at: string;
}

export default function UsuariosAdminPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");
  
  // Modal states
  const [usuarioEditando, setUsuarioEditando] = useState<Usuario | null>(null);
  const [formNome, setFormNome] = useState("");
  const [formTelefone, setFormTelefone] = useState("");
  const [formTipo, setFormTipo] = useState<"admin" | "prestador" | "consumidor">("consumidor");
  const [salvando, setSalvando] = useState(false);

  const supabase = criarClienteSupabaseNavegador();

  const carregarUsuarios = async () => {
    try {
      setCarregando(true);
      const { data, error } = await supabase
        .from("usuarios")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUsuarios(data || []);
    } catch (err: any) {
      toast.error("Erro ao carregar usuários: " + err.message);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const alternarAtivo = async (id: string, ativoAtual: boolean) => {
    try {
      const { error } = await supabase
        .from("usuarios")
        .update({ ativo: !ativoAtual })
        .eq("id", id);

      if (error) throw error;
      
      setUsuarios(usuarios.map(u => u.id === id ? { ...u, ativo: !ativoAtual } : u));
      toast.success(ativoAtual ? "Usuário desativado com sucesso!" : "Usuário ativado com sucesso!");
    } catch (err: any) {
      toast.error("Erro ao alterar status: " + err.message);
    }
  };

  const abrirEdicao = (usuario: Usuario) => {
    setUsuarioEditando(usuario);
    setFormNome(usuario.nome);
    setFormTelefone(usuario.telefone || "");
    setFormTipo(usuario.tipo_usuario);
  };

  const salvarEdicao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuarioEditando) return;

    try {
      setSalvando(true);
      const { error } = await supabase
        .from("usuarios")
        .update({
          nome: formNome,
          telefone: formTelefone,
          tipo_usuario: formTipo
        })
        .eq("id", usuarioEditando.id);

      if (error) throw error;

      setUsuarios(usuarios.map(u => u.id === usuarioEditando.id ? {
        ...u,
        nome: formNome,
        telefone: formTelefone,
        tipo_usuario: formTipo
      } : u));

      toast.success("Usuário atualizado com sucesso!");
      setUsuarioEditando(null);
    } catch (err: any) {
      toast.error("Erro ao salvar: " + err.message);
    } finally {
      setSalvando(false);
    }
  };

  const usuariosFiltrados = usuarios.filter(u => {
    const atendeBusca = 
      u.nome.toLowerCase().includes(busca.toLowerCase()) ||
      u.email.toLowerCase().includes(busca.toLowerCase());
    const atendeFiltro = filtroTipo === "todos" || u.tipo_usuario === filtroTipo;
    return atendeBusca && atendeFiltro;
  });

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="texto-destaque mb-1">Módulos de Controle</p>
          <h1 className="text-3xl font-serif font-bold text-verde_petroleo">Gestão de Usuários</h1>
          <p className="text-sm text-texto_secundario">Controle todas as contas de consumidores, prestadores e administradores.</p>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="flex flex-col md:flex-row gap-4 items-center bg-off_white p-4 rounded-xl border border-bege_borda shadow-suave">
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-texto_secundario" />
          <input
            type="text"
            placeholder="Buscar por nome ou e-mail..."
            className="campo-base pl-10"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-texto_secundario shrink-0" />
          <select
            className="campo-base py-2"
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
          >
            <option value="todos">Todos os Tipos</option>
            <option value="consumidor">Consumidores</option>
            <option value="prestador">Prestadores</option>
            <option value="admin">Administradores</option>
          </select>
        </div>
      </div>

      {/* Tabela de Dados */}
      {carregando ? (
        <EstadoCarregando texto="Carregando lista de usuários..." />
      ) : (
        <div className="cartao overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-verde_petroleo/5 border-b border-bege_borda text-xs font-semibold text-verde_petroleo uppercase tracking-wider">
                <th className="p-4">Nome</th>
                <th className="p-4">E-mail</th>
                <th className="p-4">Telefone</th>
                <th className="p-4">Tipo</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bege_borda text-sm text-texto_principal">
              {usuariosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-texto_secundario font-medium">
                    Nenhum usuário correspondente encontrado.
                  </td>
                </tr>
              ) : (
                usuariosFiltrados.map((usuario) => (
                  <tr key={usuario.id} className="hover:bg-bege_borda/10 transition">
                    <td className="p-4 font-semibold text-verde_petroleo">{usuario.nome}</td>
                    <td className="p-4 text-texto_secundario">{usuario.email}</td>
                    <td className="p-4 text-texto_secundario">{usuario.telefone || "Não cadastrado"}</td>
                    <td className="p-4">
                      <span className={clsx(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold",
                        {
                          "bg-verde_escuro/10 text-verde_escuro": usuario.tipo_usuario === "prestador",
                          "bg-dourado/10 text-dourado": usuario.tipo_usuario === "admin",
                          "bg-slate-200 text-slate-700": usuario.tipo_usuario === "consumidor"
                        }
                      )}>
                        {usuario.tipo_usuario}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={clsx(
                        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold",
                        usuario.ativo ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                      )}>
                        {usuario.ativo ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => abrirEdicao(usuario)}
                          className="p-1.5 text-texto_secundario hover:text-dourado hover:bg-dourado/10 rounded transition"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => alternarAtivo(usuario.id, usuario.ativo)}
                          className={clsx(
                            "p-1.5 rounded transition",
                            usuario.ativo 
                              ? "text-rose-600 hover:bg-rose-50" 
                              : "text-emerald-600 hover:bg-emerald-50"
                          )}
                          title={usuario.ativo ? "Desativar" : "Ativar"}
                        >
                          {usuario.ativo ? <UserMinus className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
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

      {/* Modal de Edição */}
      {usuarioEditando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-off_white rounded-2xl border border-bege_borda shadow-premium w-full max-w-md p-6 relative">
            <button
              onClick={() => setUsuarioEditando(null)}
              className="absolute right-4 top-4 p-1 hover:bg-bege_borda/20 rounded-full text-texto_secundario transition"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h2 className="text-xl font-serif font-bold text-verde_petroleo mb-6">
              Editar Usuário
            </h2>

            <form onSubmit={salvarEdicao} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-texto_secundario uppercase mb-1.5">
                  Nome Completo
                </label>
                <input
                  type="text"
                  required
                  className="campo-base"
                  value={formNome}
                  onChange={(e) => setFormNome(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-texto_secundario uppercase mb-1.5">
                  E-mail (Não Editável)
                </label>
                <input
                  type="email"
                  disabled
                  className="campo-base bg-bege_borda/25 text-texto_secundario cursor-not-allowed"
                  value={usuarioEditando.email}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-texto_secundario uppercase mb-1.5">
                  Telefone
                </label>
                <input
                  type="text"
                  className="campo-base"
                  placeholder="(85) 99999-9999"
                  value={formTelefone}
                  onChange={(e) => setFormTelefone(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-texto_secundario uppercase mb-1.5">
                  Tipo de Usuário
                </label>
                <select
                  className="campo-base font-medium"
                  value={formTipo}
                  onChange={(e) => setFormTipo(e.target.value as any)}
                >
                  <option value="consumidor">Consumidor</option>
                  <option value="prestador">Prestador</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4 border-t border-bege_borda mt-6">
                <button
                  type="button"
                  onClick={() => setUsuarioEditando(null)}
                  className="botao-secundario flex-1 py-2"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvando}
                  className="botao-primario flex-1 py-2"
                >
                  {salvando ? "Salvando..." : "Salvar Alterações"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
