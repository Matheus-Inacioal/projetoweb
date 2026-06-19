"use client";

import { useState } from "react";
import { useBuscarDados } from "@/hooks/useBuscarDados";
import { EstadoCarregando } from "@/componentes/feedback/EstadoCarregando";
import { EstadoErro } from "@/componentes/feedback/EstadoErro";
import { EstadoVazio } from "@/componentes/feedback/EstadoVazio";
import { Botao } from "@/componentes/ui/Botao";
import { CampoTexto } from "@/componentes/ui/CampoTexto";
import { AreaTexto } from "@/componentes/ui/AreaTexto";
import toast, { Toaster } from "react-hot-toast";
import { User, Phone, Mail, Award, Edit, Trash2, Plus, X, Lock, CheckCircle } from "lucide-react";

export default function GestorPrestadoresPage() {
  const { dados: barbeiros, carregando, erro, recarregar } = useBuscarDados<any[]>("/api/gestor/prestadores");

  const [modalAberto, setModalAberto] = useState(false);
  const [modalEdicao, setModalEdicao] = useState<any | null>(null);

  // Formulário de Cadastro
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [especialidade, setEspecialidade] = useState("");
  const [descricao, setDescricao] = useState("");
  const [fotoUrl, setFotoUrl] = useState("");
  const [submetendo, setSubmetendo] = useState(false);

  // Credenciais provisórias para exibir
  const [credenciaisCriadas, setCredenciaisCriadas] = useState<{ email: string; senhaProvisoria: string } | null>(null);

  // Formulário de Edição
  const [editNome, setEditNome] = useState("");
  const [editTelefone, setEditTelefone] = useState("");
  const [editEspecialidade, setEditEspecialidade] = useState("");
  const [editDescricao, setEditDescricao] = useState("");
  const [editFotoUrl, setEditFotoUrl] = useState("");
  const [editAtivo, setEditAtivo] = useState(true);

  async function handleCadastrar(e: React.FormEvent) {
    e.preventDefault();
    if (!nome || !email || !especialidade) return;

    setSubmetendo(true);
    try {
      const response = await fetch("/api/gestor/prestadores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email, telefone, especialidade, descricao, fotoUrl })
      });
      const res = await response.json();
      if (response.ok && res.sucesso) {
        toast.success("Barbeiro cadastrado!");
        setCredenciaisCriadas({ email: res.dados.email, senhaProvisoria: res.dados.senhaProvisoria });
        // Limpa form
        setNome("");
        setEmail("");
        setTelefone("");
        setEspecialidade("");
        setDescricao("");
        setFotoUrl("");
        setModalAberto(false);
        recarregar();
      } else {
        toast.error(res.mensagem || "Erro ao cadastrar.");
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
      const response = await fetch(`/api/gestor/prestadores/${modalEdicao.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: editNome,
          telefone: editTelefone,
          especialidade: editEspecialidade,
          descricao: editDescricao,
          fotoUrl: editFotoUrl,
          ativo: editAtivo
        })
      });
      const res = await response.json();
      if (response.ok && res.sucesso) {
        toast.success("Barbeiro atualizado!");
        setModalEdicao(null);
        recarregar();
      } else {
        toast.error(res.mensagem || "Erro ao atualizar.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Erro na conexão.");
    } finally {
      setSubmetendo(false);
    }
  }

  async function handleExcluir(id: string) {
    if (!confirm("Tem certeza de que deseja remover este barbeiro? Esta ação é definitiva e removerá seu cadastro.")) return;

    try {
      const response = await fetch(`/api/gestor/prestadores/${id}`, { method: "DELETE" });
      if (response.ok) {
        toast.success("Barbeiro removido.");
        recarregar();
      } else {
        toast.error("Erro ao remover barbeiro.");
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleToggleBloqueio(barbeiro: any) {
    const novoStatus = !barbeiro.ativo;
    try {
      const response = await fetch(`/api/gestor/prestadores/${barbeiro.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: barbeiro.nome,
          telefone: barbeiro.telefone,
          especialidade: barbeiro.especialidade,
          descricao: barbeiro.descricao,
          fotoUrl: barbeiro.fotoUrl,
          ativo: novoStatus
        })
      });
      if (response.ok) {
        toast.success(novoStatus ? "Barbeiro desbloqueado!" : "Barbeiro bloqueado!");
        recarregar();
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="container-pagina py-12 space-y-8">
      <Toaster position="top-center" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <p className="texto-destaque mb-2">GERENCIAMENTO</p>
          <h1 className="text-4xl font-serif font-bold text-verde_petroleo">Equipe de Barbeiros</h1>
          <p className="text-texto_secundario">Adicione profissionais, controle acessos e edite dados profissionais.</p>
        </div>
        <Botao onClick={() => setModalAberto(true)} className="flex items-center gap-2">
          <Plus className="h-5 w-5" /> Cadastrar Barbeiro
        </Botao>
      </div>

      {/* Exibição de Credenciais Criadas */}
      {credenciaisCriadas && (
        <div className="bg-green-50 border border-green-200 p-6 rounded-2xl space-y-4 max-w-lg shadow-suave">
          <div className="flex items-center gap-3 text-green-800">
            <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
            <div>
              <p className="font-bold">Conta criada com sucesso no Supabase Auth!</p>
              <p className="text-xs">Compartilhe as credenciais abaixo para que o barbeiro acesse o painel dele:</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-green-100 space-y-2 text-sm select-all">
            <p><strong>E-mail de acesso:</strong> {credenciaisCriadas.email}</p>
            <p><strong>Senha Provisória:</strong> {credenciaisCriadas.senhaProvisoria}</p>
          </div>
          <Botao variante="secundario" onClick={() => setCredenciaisCriadas(null)} larguraTotal>
            Fechar Aviso
          </Botao>
        </div>
      )}

      {/* Listagem */}
      {carregando ? (
        <EstadoCarregando texto="Buscando barbeiros..." />
      ) : erro ? (
        <EstadoErro mensagem={erro} onTentarNovamente={recarregar} />
      ) : barbeiros && barbeiros.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {barbeiros.map((b) => (
            <div
              key={b.id}
              className={`cartao bg-white border p-6 flex flex-col justify-between transition-all ${
                !b.ativo ? "opacity-60 border-red-200" : "border-bege_borda"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full overflow-hidden bg-bege_borda border border-dourado shrink-0">
                      {b.fotoUrl ? (
                        <img src={b.fotoUrl} alt={b.nome} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center font-serif text-xl font-bold text-verde_petroleo bg-marfim">
                          {b.nome.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-lg text-texto_principal">{b.nome}</h3>
                      <p className="text-xs font-semibold text-dourado uppercase tracking-wider flex items-center gap-1">
                        <Award className="h-3 w-3" /> {b.especialidade || "Geral"}
                      </p>
                    </div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    b.ativo ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}>
                    {b.ativo ? "Ativo" : "Bloqueado"}
                  </span>
                </div>

                <div className="space-y-2 my-5 text-xs text-texto_secundario border-t border-b border-bege_borda/50 py-3">
                  <p className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" /> {b.telefone || "Sem telefone"}</p>
                  <p className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" /> {b.email}</p>
                </div>

                <p className="text-xs text-texto_secundario leading-relaxed line-clamp-3">
                  {b.descricao || "Sem descrição profissional cadastrada."}
                </p>
              </div>

              {/* Ações */}
              <div className="grid grid-cols-3 gap-2 pt-6">
                <button
                  onClick={() => {
                    setModalEdicao(b);
                    setEditNome(b.nome);
                    setEditTelefone(b.telefone || "");
                    setEditEspecialidade(b.especialidade);
                    setEditDescricao(b.descricao || "");
                    setEditFotoUrl(b.fotoUrl || "");
                    setEditAtivo(b.ativo);
                  }}
                  className="bg-marfim hover:bg-bege_borda text-verde_petroleo border border-bege_borda py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                >
                  <Edit className="h-4.5 w-4.5" /> Editar
                </button>
                <button
                  onClick={() => handleToggleBloqueio(b)}
                  className={`py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition ${
                    b.ativo
                      ? "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                      : "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                  }`}
                >
                  <Lock className="h-4.5 w-4.5" /> {b.ativo ? "Bloquear" : "Ativar"}
                </button>
                <button
                  onClick={() => handleExcluir(b.id)}
                  className="bg-red-600 hover:bg-red-700 text-white py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                >
                  <Trash2 className="h-4.5 w-4.5" /> Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EstadoVazio titulo="Equipe vazia" descricao="Clique em Cadastrar Barbeiro para registrar os primeiros barbeiros de sua loja." />
      )}

      {/* MODAL CADASTRO */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-bege_borda rounded-3xl p-8 max-w-lg w-full space-y-6 shadow-premium relative animate-fade-in">
            <button onClick={() => setModalAberto(false)} className="absolute top-6 right-6 text-texto_secundario hover:text-texto_principal transition">
              <X className="h-6 w-6" />
            </button>
            <h3 className="text-2xl font-serif font-bold text-verde_petroleo">Cadastrar Barbeiro</h3>

            <form onSubmit={handleCadastrar} className="space-y-4">
              <CampoTexto label="Nome Completo" id="b-nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
              <CampoTexto label="E-mail profissional" id="b-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <CampoTexto label="Telefone / Whatsapp" id="b-tel" value={telefone} onChange={(e) => setTelefone(e.target.value)} />
              <CampoTexto label="Especialidade (Ex: Degradê, Barba clássica)" id="b-esp" value={especialidade} onChange={(e) => setEspecialidade(e.target.value)} required />
              <CampoTexto label="URL da Foto de Perfil" id="b-foto" placeholder="http://..." value={fotoUrl} onChange={(e) => setFotoUrl(e.target.value)} />
              <AreaTexto label="Descrição / Bio" id="b-desc" value={descricao} onChange={(e) => setDescricao(e.target.value)} />

              <Botao type="submit" larguraTotal disabled={submetendo}>
                {submetendo ? "Registrando..." : "Confirmar Cadastro"}
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
            <h3 className="text-2xl font-serif font-bold text-verde_petroleo">Editar Barbeiro</h3>

            <form onSubmit={handleSalvarEdicao} className="space-y-4">
              <CampoTexto label="Nome" id="e-nome" value={editNome} onChange={(e) => setEditNome(e.target.value)} required />
              <CampoTexto label="Telefone" id="e-tel" value={editTelefone} onChange={(e) => setEditTelefone(e.target.value)} />
              <CampoTexto label="Especialidade" id="e-esp" value={editEspecialidade} onChange={(e) => setEditEspecialidade(e.target.value)} required />
              <CampoTexto label="URL da Foto" id="e-foto" value={editFotoUrl} onChange={(e) => setEditFotoUrl(e.target.value)} />
              <AreaTexto label="Descrição / Bio" id="e-desc" value={editDescricao} onChange={(e) => setEditDescricao(e.target.value)} />

              <div className="flex items-center gap-2 py-1">
                <input
                  type="checkbox"
                  id="e-ativo"
                  checked={editAtivo}
                  onChange={(e) => setEditAtivo(e.target.checked)}
                  className="rounded border-bege_borda text-verde_petroleo focus:ring-verde_petroleo h-4.5 w-4.5"
                />
                <label htmlFor="e-ativo" className="text-xs font-bold text-texto_principal">
                  Perfil Ativo na Barbearia (Pode receber agendamentos)
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
