"use client";

import { useState, useEffect } from "react";
import { criarClienteSupabaseNavegador } from "@/lib/banco/supabase-client";
import { EstadoCarregando } from "@/componentes/feedback/EstadoCarregando";
import { DollarSign, Search, CheckCircle, Percent, AlertCircle, Calendar, Store, User, Scissors } from "lucide-react";
import toast from "react-hot-toast";

interface Comissao {
  id: string;
  percentual: number;
  valor: number;
  status: string;
  created_at: string;
  prestadores: {
    id: string;
    especialidade: string | null;
    usuarios: {
      nome: string;
    } | null;
    lojas: {
      nome: string;
    } | null;
  } | null;
  contratacoes: {
    id: string;
    valor_total: number;
    servicos: {
      nome: string;
    } | null;
  } | null;
}

export default function ComissoesAdminPage() {
  const [comissoes, setComissoes] = useState<Comissao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");

  const supabase = criarClienteSupabaseNavegador();

  const carregarComissoes = async () => {
    try {
      setCarregando(true);
      const { data, error } = await supabase
        .from("comissoes")
        .select(`
          id,
          percentual,
          valor,
          status,
          created_at,
          prestadores (
            id,
            especialidade,
            usuarios (nome),
            lojas (nome)
          ),
          contratacoes (
            id,
            valor_total,
            servicos (nome)
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setComissoes((data as any) || []);
    } catch (err: any) {
      toast.error("Erro ao carregar comissões: " + err.message);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarComissoes();
  }, []);

  const alternarStatusComissao = async (id: string, statusAtual: string) => {
    try {
      const novoStatus = statusAtual === "pendente" ? "paga" : "pendente";
      const { error } = await supabase
        .from("comissoes")
        .update({ status: novoStatus })
        .eq("id", id);

      if (error) throw error;

      setComissoes(comissoes.map(c => c.id === id ? { ...c, status: novoStatus } : c));
      toast.success(novoStatus === "paga" ? "Comissão marcada como PAGA!" : "Comissão marcada como PENDENTE!");
    } catch (err: any) {
      toast.error("Erro ao atualizar status da comissão: " + err.message);
    }
  };

  // Métricas
  const comissoesPendentes = comissoes.filter(c => c.status === "pendente");
  const comissoesPagas = comissoes.filter(c => c.status === "paga");

  const totalPendentes = comissoesPendentes.reduce((acc, c) => acc + Number(c.valor), 0);
  const totalPago = comissoesPagas.reduce((acc, c) => acc + Number(c.valor), 0);

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(valor);
  };

  const formatarData = (dataStr: string) => {
    if (!dataStr) return "N/D";
    try {
      const data = new Date(dataStr);
      return data.toLocaleDateString("pt-BR");
    } catch {
      return "Data Inválida";
    }
  };

  const comissoesFiltradas = comissoes.filter(c => {
    const nomeBarbeiro = c.prestadores?.usuarios?.nome || "";
    const nomeLoja = c.prestadores?.lojas?.nome || "";
    const correspondeBusca = 
      nomeBarbeiro.toLowerCase().includes(busca.toLowerCase()) ||
      nomeLoja.toLowerCase().includes(busca.toLowerCase());

    const correspondeStatus = 
      filtroStatus === "todos" || c.status === filtroStatus;

    return correspondeBusca && correspondeStatus;
  });

  if (carregando) return <EstadoCarregando texto="Carregando repasses de comissão..." />;

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-3xl font-bold font-serif text-verde_petroleo flex items-center gap-2">
          <DollarSign className="w-8 h-8 text-dourado" />
          Comissões e Repasses
        </h1>
        <p className="text-texto_secundario mt-1">
          Visão geral e auditoria de repasses financeiros devidos aos prestadores de todas as barbearias.
        </p>
      </div>

      {/* Cartões Métricas */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-marfim border border-bege_borda/50 p-6 rounded-2xl flex items-center gap-4 shadow-suave">
          <div className="bg-amber-50 text-amber-600 p-3 rounded-xl border border-amber-100">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-texto_secundario uppercase">Total Pendente (Global)</p>
            <p className="font-serif font-black text-2xl text-amber-700">{formatarMoeda(totalPendentes)}</p>
            <p className="text-[10px] text-texto_secundario mt-0.5">{comissoesPendentes.length} repasses em aberto</p>
          </div>
        </div>

        <div className="bg-marfim border border-bege_borda/50 p-6 rounded-2xl flex items-center gap-4 shadow-suave">
          <div className="bg-green-50 text-green-600 p-3 rounded-xl border border-green-100">
            <CheckCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-texto_secundario uppercase">Total Pago (Global)</p>
            <p className="font-serif font-black text-2xl text-green-700">{formatarMoeda(totalPago)}</p>
            <p className="text-[10px] text-texto_secundario mt-0.5">{comissoesPagas.length} repasses liquidados</p>
          </div>
        </div>

        <div className="bg-marfim border border-bege_borda/50 p-6 rounded-2xl flex items-center gap-4 shadow-suave">
          <div className="bg-verde_petroleo/10 text-verde_petroleo p-3 rounded-xl border border-verde_petroleo/20">
            <Percent className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-texto_secundario uppercase">Repasse Médio</p>
            <p className="font-serif font-black text-2xl text-verde_petroleo">40% / 60%</p>
            <p className="text-[10px] text-texto_secundario mt-0.5">Configuração geral configurável</p>
          </div>
        </div>
      </div>

      {/* Busca e Filtros */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-marfim p-4 rounded-xl border border-bege_borda/50 shadow-suave">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-texto_secundario" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por barbeiro ou loja parceira..."
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
            <option value="pendente">Pendente</option>
            <option value="paga">Paga</option>
          </select>
        </div>
      </div>

      {/* Tabela */}
      {comissoesFiltradas.length === 0 ? (
        <div className="text-center py-16 bg-marfim rounded-2xl border border-bege_borda/50 shadow-suave">
          <AlertCircle className="w-16 h-16 text-texto_secundario/40 mx-auto mb-4" />
          <h3 className="text-lg font-serif font-bold text-verde_petroleo">Nenhum repasse registrado</h3>
          <p className="text-texto_secundario mt-1">Repasses são gerados automaticamente ao concluir contratações de serviços.</p>
        </div>
      ) : (
        <div className="bg-marfim rounded-2xl border border-bege_borda/50 shadow-suave overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-off_white border-b border-bege_borda/40 text-verde_escuro font-serif text-sm">
                  <th className="p-4 font-bold">Barbeiro / Loja</th>
                  <th className="p-4 font-bold">Data Atendimento</th>
                  <th className="p-4 font-bold">Serviço / Valor Total</th>
                  <th className="p-4 font-bold">Repasse (%)</th>
                  <th className="p-4 font-bold text-right">Valor Repasse</th>
                  <th className="p-4 font-bold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-bege_borda/20 text-sm">
                {comissoesFiltradas.map((c) => (
                  <tr key={c.id} className="hover:bg-off_white/50 transition-colors">
                    <td className="p-4">
                      <div className="flex flex-col gap-0.5">
                        <div className="font-semibold text-verde_petroleo flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-dourado shrink-0" />
                          {c.prestadores?.usuarios?.nome || "Barbeiro"}
                        </div>
                        <div className="text-xs text-texto_secundario flex items-center gap-1">
                          <Store className="w-3 h-3 text-texto_secundario shrink-0" />
                          {c.prestadores?.lojas?.nome || "Plataforma"}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-texto_secundario text-xs">
                        <Calendar className="w-3.5 h-3.5 text-dourado" />
                        {formatarData(c.created_at)}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-0.5">
                        <div className="font-medium text-verde_escuro flex items-center gap-1">
                          <Scissors className="w-3.5 h-3.5 text-dourado shrink-0" />
                          {c.contratacoes?.servicos?.nome || "Serviço"}
                        </div>
                        <div className="text-xs text-texto_secundario">
                          Serviço: {formatarMoeda(c.contratacoes?.valor_total || 0)}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-medium text-verde_petroleo bg-verde_petroleo/10 px-2 py-0.5 rounded text-xs">
                        {c.percentual}%
                      </span>
                    </td>
                    <td className="p-4 text-right font-serif font-black text-verde_escuro">
                      {formatarMoeda(c.valor)}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center">
                        <button
                          onClick={() => alternarStatusComissao(c.id, c.status)}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                            c.status === "paga"
                              ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                              : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                          }`}
                        >
                          {c.status === "paga" ? "Pago" : "Pendente"}
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
    </div>
  );
}
