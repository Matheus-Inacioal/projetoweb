"use client";

import { useState, useEffect } from "react";
import { criarClienteSupabaseNavegador } from "@/lib/banco/supabase-client";
import { EstadoCarregando } from "@/componentes/feedback/EstadoCarregando";
import { Search, Plus, Edit, ShieldAlert, Store, MapPin, Phone, Mail, ToggleLeft, ToggleRight, X, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import Image from "next/image";

interface Loja {
  id: string;
  nome: string;
  descricao: string | null;
  cnpj: string | null;
  telefone: string | null;
  email: string | null;
  endereco: string | null;
  cidade: string | null;
  estado: string | null;
  cep: string | null;
  logo_url: string | null;
  capa_url: string | null;
  ativo: boolean;
  created_at: string;
}

export default function LojasAdminPage() {
  const [lojas, setLojas] = useState<Loja[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");

  // Modal State
  const [modalAberto, setModalAberto] = useState(false);
  const [lojaEditando, setLojaEditando] = useState<Loja | null>(null);
  
  // Form State
  const [formNome, setFormNome] = useState("");
  const [formDescricao, setFormDescricao] = useState("");
  const [formCnpj, setFormCnpj] = useState("");
  const [formTelefone, setFormTelefone] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formEndereco, setFormEndereco] = useState("");
  const [formCidade, setFormCidade] = useState("");
  const [formEstado, setFormEstado] = useState("");
  const [formCep, setFormCep] = useState("");
  const [formLogoUrl, setFormLogoUrl] = useState("");
  const [formCapaUrl, setFormCapaUrl] = useState("");
  const [formAtivo, setFormAtivo] = useState(true);
  
  const [salvando, setSalvando] = useState(false);

  const supabase = criarClienteSupabaseNavegador();

  const carregarLojas = async () => {
    try {
      setCarregando(true);
      const { data, error } = await supabase
        .from("lojas")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setLojas(data || []);
    } catch (err: any) {
      toast.error("Erro ao carregar lojas: " + err.message);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarLojas();
  }, []);

  const abrirCriacao = () => {
    setLojaEditando(null);
    setFormNome("");
    setFormDescricao("");
    setFormCnpj("");
    setFormTelefone("");
    setFormEmail("");
    setFormEndereco("");
    setFormCidade("");
    setFormEstado("");
    setFormCep("");
    setFormLogoUrl("");
    setFormCapaUrl("");
    setFormAtivo(true);
    setModalAberto(true);
  };

  const abrirEdicao = (loja: Loja) => {
    setLojaEditando(loja);
    setFormNome(loja.nome);
    setFormDescricao(loja.descricao || "");
    setFormCnpj(loja.cnpj || "");
    setFormTelefone(loja.telefone || "");
    setFormEmail(loja.email || "");
    setFormEndereco(loja.endereco || "");
    setFormCidade(loja.cidade || "");
    setFormEstado(loja.estado || "");
    setFormCep(loja.cep || "");
    setFormLogoUrl(loja.logo_url || "");
    setFormCapaUrl(loja.capa_url || "");
    setFormAtivo(loja.ativo);
    setModalAberto(true);
  };

  const alternarStatus = async (id: string, ativoAtual: boolean) => {
    try {
      const { error } = await supabase
        .from("lojas")
        .update({ ativo: !ativoAtual })
        .eq("id", id);

      if (error) throw error;
      
      setLojas(lojas.map(l => l.id === id ? { ...l, ativo: !ativoAtual } : l));
      toast.success(ativoAtual ? "Loja desativada/bloqueada!" : "Loja ativada com sucesso!");
    } catch (err: any) {
      toast.error("Erro ao alterar status da loja: " + err.message);
    }
  };

  const salvarLoja = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNome.trim()) {
      toast.error("O nome da loja é obrigatório.");
      return;
    }

    try {
      setSalvando(true);
      const payload = {
        nome: formNome,
        descricao: formDescricao || null,
        cnpj: formCnpj || null,
        telefone: formTelefone || null,
        email: formEmail || null,
        endereco: formEndereco || null,
        cidade: formCidade || null,
        estado: formEstado || null,
        cep: formCep || null,
        logo_url: formLogoUrl || null,
        capa_url: formCapaUrl || null,
        ativo: formAtivo
      };

      if (lojaEditando) {
        // Editar
        const { error } = await supabase
          .from("lojas")
          .update(payload)
          .eq("id", lojaEditando.id);
        if (error) throw error;
        toast.success("Loja atualizada com sucesso!");
      } else {
        // Criar
        const { error } = await supabase
          .from("lojas")
          .insert(payload);
        if (error) throw error;
        toast.success("Loja criada com sucesso!");
      }

      setModalAberto(false);
      carregarLojas();
    } catch (err: any) {
      toast.error("Erro ao salvar loja: " + err.message);
    } finally {
      setSalvando(false);
    }
  };

  const lojasFiltradas = lojas.filter(loja => {
    const correspondeBusca = 
      loja.nome.toLowerCase().includes(busca.toLowerCase()) ||
      (loja.cidade && loja.cidade.toLowerCase().includes(busca.toLowerCase())) ||
      (loja.cnpj && loja.cnpj.includes(busca));
      
    const correspondeStatus = 
      filtroStatus === "todos" ||
      (filtroStatus === "ativo" && loja.ativo) ||
      (filtroStatus === "bloqueado" && !loja.ativo);

    return correspondeBusca && correspondeStatus;
  });

  if (carregando) return <EstadoCarregando texto="Carregando lojas cadastradas..." />;

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-serif text-verde_petroleo flex items-center gap-2">
            <Store className="w-8 h-8 text-dourado" />
            Lojas Parceiras
          </h1>
          <p className="text-texto_secundario mt-1">
            Gerencie e audite todos os estabelecimentos cadastrados no marketplace BarberGo.
          </p>
        </div>
        <button
          onClick={abrirCriacao}
          className="botao-primario self-start flex items-center gap-2 bg-verde_petroleo hover:bg-verde_escuro text-marfim px-4 py-2.5 rounded-lg font-medium transition-all"
        >
          <Plus className="w-5 h-5" />
          Cadastrar Nova Loja
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
            placeholder="Buscar por nome, cidade ou CNPJ..."
            className="w-full pl-10 pr-4 py-2.5 bg-off_white border border-bege_borda rounded-lg focus:outline-none focus:border-dourado text-sm transition-all"
          />
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-sm font-medium text-texto_secundario whitespace-nowrap">Status:</span>
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="w-full sm:w-40 px-3 py-2.5 bg-off_white border border-bege_borda rounded-lg text-sm focus:outline-none focus:border-dourado"
          >
            <option value="todos">Todos</option>
            <option value="ativo">Ativas</option>
            <option value="bloqueado">Bloqueadas</option>
          </select>
        </div>
      </div>

      {/* Grid de Lojas */}
      {lojasFiltradas.length === 0 ? (
        <div className="text-center py-16 bg-marfim rounded-2xl border border-bege_borda/50 shadow-suave">
          <Store className="w-16 h-16 text-texto_secundario/40 mx-auto mb-4" />
          <h3 className="text-lg font-serif font-bold text-verde_petroleo">Nenhuma loja encontrada</h3>
          <p className="text-texto_secundario mt-1">Refine seus termos de busca ou filtros.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {lojasFiltradas.map((loja) => (
            <div
              key={loja.id}
              className={`bg-marfim border rounded-2xl overflow-hidden shadow-suave flex flex-col transition-all duration-300 ${
                loja.ativo ? "border-bege_borda/50" : "border-vermelho_coral/40 opacity-90"
              }`}
            >
              {/* Capa */}
              <div className="relative h-32 bg-verde_petroleo/20 overflow-hidden">
                {loja.capa_url ? (
                  <img
                    src={loja.capa_url}
                    alt={`Capa de ${loja.nome}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-verde_petroleo to-verde_escuro opacity-40 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-dourado" />
                  </div>
                )}
                {/* Logo da Loja */}
                <div className="absolute bottom-2 left-4 w-16 h-16 rounded-xl overflow-hidden border-2 border-marfim bg-marfim shadow-suave">
                  {loja.logo_url ? (
                    <img
                      src={loja.logo_url}
                      alt={`Logo de ${loja.nome}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-off_white">
                      <Store className="w-8 h-8 text-verde_petroleo" />
                    </div>
                  )}
                </div>
                
                {/* Badge de Status */}
                <div className="absolute top-3 right-3">
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full shadow-suave ${
                      loja.ativo
                        ? "bg-verde_petroleo/90 text-marfim border border-marfim/10"
                        : "bg-vermelho_coral text-marfim border border-marfim/10"
                    }`}
                  >
                    {loja.ativo ? "Ativa" : "Bloqueada"}
                  </span>
                </div>
              </div>

              {/* Informações */}
              <div className="p-5 flex-1 flex flex-col">
                <div className="mb-4">
                  <h3 className="text-xl font-serif font-bold text-verde_petroleo truncate">
                    {loja.nome}
                  </h3>
                  <p className="text-sm text-texto_secundario line-clamp-2 mt-1 min-h-[40px]">
                    {loja.descricao || "Sem descrição cadastrada."}
                  </p>
                </div>

                <div className="space-y-2.5 text-sm text-texto_secundario mb-6 mt-auto">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-dourado shrink-0" />
                    <span className="truncate">
                      {loja.endereco ? `${loja.endereco}, ` : ""}
                      {loja.cidade || "Cidade N/D"} - {loja.estado || "UF"}
                    </span>
                  </div>
                  {loja.telefone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-dourado shrink-0" />
                      <span>{loja.telefone}</span>
                    </div>
                  )}
                  {loja.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-dourado shrink-0" />
                      <span className="truncate">{loja.email}</span>
                    </div>
                  )}
                </div>

                {/* Ações */}
                <div className="flex items-center justify-between gap-3 pt-4 border-t border-bege_borda/30">
                  <button
                    onClick={() => abrirEdicao(loja)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 border border-bege_borda hover:bg-off_white rounded-lg text-xs font-semibold text-verde_petroleo transition-all"
                  >
                    <Edit className="w-4 h-4" />
                    Editar Dados
                  </button>
                  <button
                    onClick={() => alternarStatus(loja.id, loja.ativo)}
                    className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                      loja.ativo
                        ? "bg-vermelho_coral/10 hover:bg-vermelho_coral/20 text-vermelho_coral"
                        : "bg-verde_petroleo/10 hover:bg-verde_petroleo/20 text-verde_petroleo"
                    }`}
                  >
                    {loja.ativo ? (
                      <>
                        <ToggleLeft className="w-4 h-4" />
                        Bloquear
                      </>
                    ) : (
                      <>
                        <ToggleRight className="w-4 h-4" />
                        Ativar
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Criação / Edição */}
      {modalAberto && (
        <div className="fixed inset-0 bg-verde_escuro/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-marfim rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-bege_borda shadow-premium animate-fade-in">
            {/* Header Modal */}
            <div className="p-6 border-b border-bege_borda/30 flex items-center justify-between">
              <h2 className="text-2xl font-serif font-bold text-verde_petroleo flex items-center gap-2">
                <Store className="w-6 h-6 text-dourado" />
                {lojaEditando ? "Editar Estabelecimento" : "Novo Estabelecimento"}
              </h2>
              <button
                onClick={() => setModalAberto(false)}
                className="p-2 hover:bg-off_white rounded-full text-texto_secundario transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={salvarLoja} className="p-6 space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Nome */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-verde_escuro uppercase tracking-wider mb-1.5">
                    Nome da Barbearia / Loja *
                  </label>
                  <input
                    type="text"
                    value={formNome}
                    onChange={(e) => setFormNome(e.target.value)}
                    required
                    placeholder="Ex: Barbearia Elegance"
                    className="w-full px-3 py-2 border border-bege_borda rounded-lg text-sm bg-off_white focus:outline-none focus:border-dourado focus:bg-marfim"
                  />
                </div>

                {/* Descrição */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-verde_escuro uppercase tracking-wider mb-1.5">
                    Descrição / Slogan
                  </label>
                  <textarea
                    value={formDescricao}
                    onChange={(e) => setFormDescricao(e.target.value)}
                    placeholder="Ex: Excelência em cortes masculinos e tratamentos capilares desde 2018."
                    rows={2}
                    className="w-full px-3 py-2 border border-bege_borda rounded-lg text-sm bg-off_white focus:outline-none focus:border-dourado focus:bg-marfim resize-none"
                  />
                </div>

                {/* CNPJ */}
                <div>
                  <label className="block text-xs font-semibold text-verde_escuro uppercase tracking-wider mb-1.5">
                    CNPJ
                  </label>
                  <input
                    type="text"
                    value={formCnpj}
                    onChange={(e) => setFormCnpj(e.target.value)}
                    placeholder="00.000.000/0001-00"
                    className="w-full px-3 py-2 border border-bege_borda rounded-lg text-sm bg-off_white focus:outline-none focus:border-dourado focus:bg-marfim"
                  />
                </div>

                {/* Telefone */}
                <div>
                  <label className="block text-xs font-semibold text-verde_escuro uppercase tracking-wider mb-1.5">
                    Telefone de Contato
                  </label>
                  <input
                    type="text"
                    value={formTelefone}
                    onChange={(e) => setFormTelefone(e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="w-full px-3 py-2 border border-bege_borda rounded-lg text-sm bg-off_white focus:outline-none focus:border-dourado focus:bg-marfim"
                  />
                </div>

                {/* Email */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-verde_escuro uppercase tracking-wider mb-1.5">
                    E-mail Institucional
                  </label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="contato@barbearia.com"
                    className="w-full px-3 py-2 border border-bege_borda rounded-lg text-sm bg-off_white focus:outline-none focus:border-dourado focus:bg-marfim"
                  />
                </div>

                {/* Endereço */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-verde_escuro uppercase tracking-wider mb-1.5">
                    Endereço Completo
                  </label>
                  <input
                    type="text"
                    value={formEndereco}
                    onChange={(e) => setFormEndereco(e.target.value)}
                    placeholder="Rua, número, complemento e bairro"
                    className="w-full px-3 py-2 border border-bege_borda rounded-lg text-sm bg-off_white focus:outline-none focus:border-dourado focus:bg-marfim"
                  />
                </div>

                {/* Cidade */}
                <div>
                  <label className="block text-xs font-semibold text-verde_escuro uppercase tracking-wider mb-1.5">
                    Cidade
                  </label>
                  <input
                    type="text"
                    value={formCidade}
                    onChange={(e) => setFormCidade(e.target.value)}
                    placeholder="Ex: São Paulo"
                    className="w-full px-3 py-2 border border-bege_borda rounded-lg text-sm bg-off_white focus:outline-none focus:border-dourado focus:bg-marfim"
                  />
                </div>

                {/* Estado e CEP */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-1">
                    <label className="block text-xs font-semibold text-verde_escuro uppercase tracking-wider mb-1.5">
                      UF
                    </label>
                    <input
                      type="text"
                      value={formEstado}
                      onChange={(e) => setFormEstado(e.target.value)}
                      maxLength={2}
                      placeholder="SP"
                      className="w-full px-3 py-2 border border-bege_borda rounded-lg text-sm text-center bg-off_white focus:outline-none focus:border-dourado focus:bg-marfim uppercase"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-verde_escuro uppercase tracking-wider mb-1.5">
                      CEP
                    </label>
                    <input
                      type="text"
                      value={formCep}
                      onChange={(e) => setFormCep(e.target.value)}
                      placeholder="01234-567"
                      className="w-full px-3 py-2 border border-bege_borda rounded-lg text-sm bg-off_white focus:outline-none focus:border-dourado focus:bg-marfim"
                    />
                  </div>
                </div>

                {/* Logo URL */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-verde_escuro uppercase tracking-wider mb-1.5">
                    URL da Logotipo
                  </label>
                  <input
                    type="url"
                    value={formLogoUrl}
                    onChange={(e) => setFormLogoUrl(e.target.value)}
                    placeholder="https://exemplo.com/imagens/logo.png"
                    className="w-full px-3 py-2 border border-bege_borda rounded-lg text-sm bg-off_white focus:outline-none focus:border-dourado focus:bg-marfim"
                  />
                </div>

                {/* Capa URL */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-verde_escuro uppercase tracking-wider mb-1.5">
                    URL da Foto de Capa
                  </label>
                  <input
                    type="url"
                    value={formCapaUrl}
                    onChange={(e) => setFormCapaUrl(e.target.value)}
                    placeholder="https://exemplo.com/imagens/capa.png"
                    className="w-full px-3 py-2 border border-bege_borda rounded-lg text-sm bg-off_white focus:outline-none focus:border-dourado focus:bg-marfim"
                  />
                </div>

                {/* Ativo toggle */}
                <div className="sm:col-span-2 flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="formAtivo"
                    checked={formAtivo}
                    onChange={(e) => setFormAtivo(e.target.checked)}
                    className="w-4 h-4 rounded text-verde_petroleo border-bege_borda focus:ring-verde_petroleo cursor-pointer"
                  />
                  <label htmlFor="formAtivo" className="text-sm font-semibold text-verde_escuro select-none cursor-pointer">
                    Loja ativa e visível para os consumidores no marketplace
                  </label>
                </div>
              </div>

              {/* Botões Ação */}
              <div className="flex items-center justify-end gap-3 pt-6 border-t border-bege_borda/30">
                <button
                  type="button"
                  onClick={() => setModalAberto(false)}
                  className="px-5 py-2.5 border border-bege_borda hover:bg-off_white rounded-lg text-sm font-semibold text-texto_secundario transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvando}
                  className="px-5 py-2.5 bg-verde_petroleo hover:bg-verde_escuro disabled:bg-verde_petroleo/50 text-marfim rounded-lg text-sm font-semibold transition-all"
                >
                  {salvando ? "Salvando..." : "Salvar Estabelecimento"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
