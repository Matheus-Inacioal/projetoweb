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
import { Scissors, Clock, DollarSign, Plus, Edit, Trash2, X } from "lucide-react";

export default function GestorServicosPage() {
  const { dados: servicos, carregando, erro, recarregar } = useBuscarDados<any[]>("/api/gestor/servicos");

  const [modalAberto, setModalAberto] = useState(false);
  const [modalEdicao, setModalEdicao] = useState<any | null>(null);

  // Cadastro State
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [preco, setPreco] = useState("");
  const [duracaoMinutos, setDuracaoMinutos] = useState("30");
  const [submetendo, setSubmetendo] = useState(false);

  // Edição State
  const [editNome, setEditNome] = useState("");
  const [editDescricao, setEditDescricao] = useState("");
  const [editPreco, setEditPreco] = useState("");
  const [editDuracao, setEditDuracao] = useState("30");
  const [editAtivo, setEditAtivo] = useState(true);

  async function handleCadastrar(e: React.FormEvent) {
    e.preventDefault();
    if (!nome || !preco || !duracaoMinutos) return;

    setSubmetendo(true);
    try {
      const response = await fetch("/api/gestor/servicos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome,
          descricao,
          preco: Number(preco),
          duracaoMinutos: Number(duracaoMinutos)
        })
      });
      const res = await response.json();
      if (response.ok && res.sucesso) {
        toast.success("Serviço adicionado!");
        setNome("");
        setDescricao("");
        setPreco("");
        setDuracaoMinutos("30");
        setModalAberto(false);
        recarregar();
      } else {
        toast.error(res.mensagem || "Erro ao criar serviço.");
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
      const response = await fetch(`/api/gestor/servicos/${modalEdicao.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: editNome,
          descricao: editDescricao,
          preco: Number(editPreco),
          duracaoMinutos: Number(editDuracao),
          ativo: editAtivo
        })
      });
      const res = await response.json();
      if (response.ok && res.sucesso) {
        toast.success("Serviço atualizado!");
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
    if (!confirm("Tem certeza de que deseja excluir este serviço de forma definitiva?")) return;

    try {
      const response = await fetch(`/api/gestor/servicos/${id}`, { method: "DELETE" });
      if (response.ok) {
        toast.success("Serviço removido.");
        recarregar();
      } else {
        toast.error("Erro ao excluir serviço.");
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
          <p className="texto-destaque mb-2">CATÁLOGO</p>
          <h1 className="text-4xl font-serif font-bold text-verde_petroleo">Serviços Oferecidos</h1>
          <p className="text-texto_secundario">Gerencie as opções do menu de atendimentos, preços e durações.</p>
        </div>
        <Botao onClick={() => setModalAberto(true)} className="flex items-center gap-2">
          <Plus className="h-5 w-5" /> Novo Serviço
        </Botao>
      </div>

      {/* Listagem */}
      {carregando ? (
        <EstadoCarregando texto="Buscando menu de serviços..." />
      ) : erro ? (
        <EstadoErro mensagem={erro} onTentarNovamente={recarregar} />
      ) : servicos && servicos.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {servicos.map((s) => (
            <div
              key={s.id}
              className={`cartao bg-white border p-6 flex flex-col justify-between transition ${
                !s.ativo ? "opacity-60 border-red-200" : "border-bege_borda"
              }`}
            >
              <div>
                <div className="flex justify-between items-start gap-4">
                  <div className="bg-marfim p-3.5 rounded-2xl border border-bege_borda text-verde_petroleo shrink-0">
                    <Scissors className="h-6 w-6" />
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    s.ativo ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}>
                    {s.ativo ? "Ativo" : "Inativo"}
                  </span>
                </div>

                <div className="my-4 space-y-1">
                  <h3 className="font-serif font-bold text-lg text-texto_principal">{s.nome}</h3>
                  <p className="text-xs text-texto_secundario line-clamp-2">{s.descricao || "Sem descrição cadastrada."}</p>
                </div>

                <div className="flex items-center gap-6 border-t border-bege_borda/50 pt-3 text-xs text-texto_secundario font-semibold">
                  <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {s.duracao_minutos} minutos</span>
                  <span className="flex items-center gap-1 font-serif font-black text-verde_petroleo text-sm">
                    <DollarSign className="h-3.5 w-3.5 text-dourado" /> {formatarMoeda(s.preco)}
                  </span>
                </div>
              </div>

              {/* Ações */}
              <div className="grid grid-cols-2 gap-3 pt-6 border-t border-bege_borda/30 mt-5">
                <button
                  onClick={() => {
                    setModalEdicao(s);
                    setEditNome(s.nome);
                    setEditDescricao(s.descricao || "");
                    setEditPreco(s.preco.toString());
                    setEditDuracao(s.duracao_minutos.toString());
                    setEditAtivo(s.ativo);
                  }}
                  className="bg-marfim hover:bg-bege_borda text-verde_petroleo border border-bege_borda py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                >
                  <Edit className="h-4.5 w-4.5" /> Editar
                </button>
                <button
                  onClick={() => handleExcluir(s.id)}
                  className="bg-red-600 hover:bg-red-700 text-white py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                >
                  <Trash2 className="h-4.5 w-4.5" /> Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EstadoVazio titulo="Nenhum serviço catalogado" descricao="Cadastre os serviços oferecidos em sua barbearia para começar." />
      )}

      {/* MODAL CADASTRO */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-bege_borda rounded-3xl p-8 max-w-lg w-full space-y-6 shadow-premium relative animate-fade-in">
            <button onClick={() => setModalAberto(false)} className="absolute top-6 right-6 text-texto_secundario hover:text-texto_principal transition">
              <X className="h-6 w-6" />
            </button>
            <h3 className="text-2xl font-serif font-bold text-verde_petroleo">Novo Serviço</h3>

            <form onSubmit={handleCadastrar} className="space-y-4">
              <CampoTexto label="Nome do Serviço" id="s-nome" placeholder="Ex: Corte degradê navalhado" value={nome} onChange={(e) => setNome(e.target.value)} required />
              <CampoTexto label="Preço (R$)" id="s-preco" type="number" step="0.01" placeholder="0,00" value={preco} onChange={(e) => setPreco(e.target.value)} required />
              <CampoTexto label="Duração em Minutos" id="s-dur" type="number" value={duracaoMinutos} onChange={(e) => setDuracaoMinutos(e.target.value)} required />
              <AreaTexto label="Descrição do serviço" id="s-desc" placeholder="Ex: Lavagem inclusa, finalizado com cera premium." value={descricao} onChange={(e) => setDescricao(e.target.value)} />

              <Botao type="submit" larguraTotal disabled={submetendo}>
                {submetendo ? "Criando..." : "Confirmar Cadastro"}
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
            <h3 className="text-2xl font-serif font-bold text-verde_petroleo">Editar Serviço</h3>

            <form onSubmit={handleSalvarEdicao} className="space-y-4">
              <CampoTexto label="Nome" id="e-nome" value={editNome} onChange={(e) => setEditNome(e.target.value)} required />
              <CampoTexto label="Preço (R$)" id="e-preco" type="number" step="0.01" value={editPreco} onChange={(e) => setEditPreco(e.target.value)} required />
              <CampoTexto label="Duração" id="e-dur" type="number" value={editDuracao} onChange={(e) => setEditDuracao(e.target.value)} required />
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
                  Serviço Ativo (Visível no menu para agendamentos)
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
