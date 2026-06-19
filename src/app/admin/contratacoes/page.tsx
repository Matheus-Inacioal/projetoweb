"use client";

import { useState, useEffect } from "react";
import { criarClienteSupabaseNavegador } from "@/lib/banco/supabase-client";
import { EstadoCarregando } from "@/componentes/feedback/EstadoCarregando";
import { Search, Filter, Ban, Eye, X, CalendarCheck, Clock, User, Award, DollarSign } from "lucide-react";
import toast from "react-hot-toast";

interface Agendamento {
  id: string;
  status: string;
  valor: number;
  observacao: string | null;
  created_at: string;
  consumidor_nome: string;
  consumidor_email: string;
  prestador_nome: string;
  prestador_especialidade: string;
  servico_nome: string;
  duracao_minutos: number;
  agenda_data: string;
  hora_inicio: string;
  hora_fim: string;
}

export default function ContratacoesAdminPage() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  
  // Detail Modal state
  const [agSelecionado, setAgSelecionado] = useState<Agendamento | null>(null);

  const supabase = criarClienteSupabaseNavegador();

  const carregarAgendamentos = async () => {
    try {
      setCarregando(true);
      const { data, error } = await supabase
        .from("vw_agendamentos_detalhados")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      setAgendamentos(
        (data || []).map((a: any) => ({
          id: a.agendamento_id,
          status: a.status,
          valor: Number(a.valor),
          observacao: a.observacao,
          created_at: a.created_at,
          consumidor_nome: a.consumidor_nome || "Cliente",
          consumidor_email: a.consumidor_email || "",
          prestador_nome: a.prestador_nome || "Barbeiro",
          prestador_especialidade: a.prestador_especialidade || "",
          servico_nome: a.servico_nome || "Serviço",
          duracao_minutos: Number(a.duracao_minutos || 30),
          agenda_data: a.agenda_data,
          hora_inicio: a.hora_inicio,
          hora_fim: a.hora_fim
        }))
      );
    } catch (err: any) {
      toast.error("Erro ao buscar contratações: " + err.message);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarAgendamentos();
  }, []);

  const cancelarAgendamento = async (id: string) => {
    if (!confirm("Deseja realmente cancelar este agendamento? Esta ação não pode ser desfeita.")) return;

    try {
      // 1. Busca o ID do slot da agenda para liberá-lo
      const { data: agData, error: findErr } = await supabase
        .from("agendamentos")
        .select("agenda_id")
        .eq("id", id)
        .single();
      
      if (findErr) throw findErr;

      // 2. Cancela agendamento e libera a agenda no banco
      const promises = [
        supabase.from("agendamentos").update({ status: "cancelado" }).eq("id", id)
      ];

      if (agData?.agenda_id) {
        promises.push(
          supabase.from("agenda").update({ disponivel: true }).eq("id", agData.agenda_id)
        );
      }

      await Promise.all(promises);

      setAgendamentos(agendamentos.map(a => a.id === id ? { ...a, status: "cancelado" } : a));
      if (agSelecionado?.id === id) {
        setAgSelecionado({ ...agSelecionado, status: "cancelado" });
      }
      toast.success("Agendamento cancelado com sucesso!");
    } catch (err: any) {
      toast.error("Erro ao cancelar: " + err.message);
    }
  };

  const filtrados = agendamentos.filter(a => {
    const matchesBusca =
      a.consumidor_nome.toLowerCase().includes(busca.toLowerCase()) ||
      a.prestador_nome.toLowerCase().includes(busca.toLowerCase()) ||
      a.servico_nome.toLowerCase().includes(busca.toLowerCase());
    
    const matchesStatus = filtroStatus === "todos" || a.status === filtroStatus;

    return matchesBusca && matchesStatus;
  });

  const formatarData = (dataSql: string) => {
    if (!dataSql) return "";
    const [ano, mes, dia] = dataSql.split("-");
    return `${dia}/${mes}/${ano}`;
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div>
        <p className="texto-destaque mb-1">Módulos de Controle</p>
        <h1 className="text-3xl font-serif font-bold text-verde_petroleo">Gestão de Contratações</h1>
        <p className="text-sm text-texto_secundario">Acompanhe todos os agendamentos, consulte detalhes de serviços contratados e gerencie cancelamentos.</p>
      </div>

      {/* Barra de Filtros */}
      <div className="flex flex-col md:flex-row gap-4 items-center bg-off_white p-4 rounded-xl border border-bege_borda shadow-suave">
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-texto_secundario" />
          <input
            type="text"
            placeholder="Buscar por cliente, barbeiro ou serviço..."
            className="campo-base pl-10"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-texto_secundario shrink-0" />
          <select
            className="campo-base py-2"
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
          >
            <option value="todos">Todos os Status</option>
            <option value="pendente">Pendente</option>
            <option value="aguardando_pagamento">Aguardando Pagamento</option>
            <option value="pago">Pago</option>
            <option value="concluido">Concluído</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>
      </div>

      {/* Lista de Contratações */}
      {carregando ? (
        <EstadoCarregando texto="Carregando contratações..." />
      ) : (
        <div className="cartao overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-verde_petroleo/5 border-b border-bege_borda text-xs font-semibold text-verde_petroleo uppercase tracking-wider">
                <th className="p-4">Cliente</th>
                <th className="p-4">Barbeiro</th>
                <th className="p-4">Serviço</th>
                <th className="p-4">Horário Reservado</th>
                <th className="p-4">Preço</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bege_borda text-sm text-texto_principal">
              {filtrados.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-texto_secundario font-medium">
                    Nenhuma contratação encontrada.
                  </td>
                </tr>
              ) : (
                filtrados.map((a) => (
                  <tr key={a.id} className="hover:bg-bege_borda/10 transition">
                    <td className="p-4 font-semibold text-verde_petroleo">{a.consumidor_nome}</td>
                    <td className="p-4 text-texto_secundario font-medium">{a.prestador_nome}</td>
                    <td className="p-4 font-medium">{a.servico_nome}</td>
                    <td className="p-4 text-texto_secundario">
                      {formatarData(a.agenda_data)} - {a.hora_inicio.slice(0, 5)}
                    </td>
                    <td className="p-4 font-serif font-bold text-verde_escuro">
                      R$ {a.valor.toFixed(2)}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        {
                          pendente: "bg-amber-100 text-amber-800",
                          aguardando_pagamento: "bg-blue-100 text-blue-800",
                          pago: "bg-emerald-100 text-emerald-800",
                          concluido: "bg-slate-200 text-slate-800",
                          cancelado: "bg-rose-100 text-rose-800"
                        }[a.status] || "bg-gray-100 text-gray-800"
                      }`}>
                        {a.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => setAgSelecionado(a)}
                          className="p-1.5 text-texto_secundario hover:text-dourado hover:bg-dourado/10 rounded transition"
                          title="Ver Detalhes"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {a.status !== "cancelado" && a.status !== "concluido" && (
                          <button
                            onClick={() => cancelarAgendamento(a.id)}
                            className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded transition"
                            title="Cancelar Agendamento"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de Detalhes Completo */}
      {agSelecionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-off_white rounded-2xl border border-bege_borda shadow-premium w-full max-w-md p-6 relative">
            <button
              onClick={() => setAgSelecionado(null)}
              className="absolute right-4 top-4 p-1 hover:bg-bege_borda/20 rounded-full text-texto_secundario transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-serif font-bold text-verde_petroleo mb-6 flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-dourado" />
              Ficha do Agendamento
            </h2>

            <div className="space-y-4 text-sm text-texto_principal">
              {/* Status */}
              <div className="flex items-center justify-between p-3 bg-bege_borda/15 rounded-lg border border-bege_borda/40">
                <span className="font-semibold text-xs text-texto_secundario uppercase">Status Atual</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                  agSelecionado.status === "pago" || agSelecionado.status === "concluido" 
                    ? "bg-emerald-100 text-emerald-800" 
                    : agSelecionado.status === "cancelado" 
                      ? "bg-rose-100 text-rose-800" 
                      : "bg-amber-100 text-amber-800"
                }`}>
                  {agSelecionado.status.replace("_", " ")}
                </span>
              </div>

              {/* Informações */}
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-dourado shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-verde_petroleo">Consumidor (Cliente)</p>
                    <p className="text-xs text-texto_secundario">{agSelecionado.consumidor_nome}</p>
                    <p className="text-xs text-texto_secundario">{agSelecionado.consumidor_email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Award className="w-5 h-5 text-dourado shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-verde_petroleo">Prestador (Profissional)</p>
                    <p className="text-xs text-texto_secundario">{agSelecionado.prestador_nome} ({agSelecionado.prestador_especialidade})</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-dourado shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-verde_petroleo">Serviço & Horário</p>
                    <p className="text-xs text-texto_secundario">{agSelecionado.servico_nome} ({agSelecionado.duracao_minutos} min)</p>
                    <p className="text-xs text-texto_secundario">Data: {formatarData(agSelecionado.agenda_data)}</p>
                    <p className="text-xs text-texto_secundario">Horário: {agSelecionado.hora_inicio.slice(0, 5)} - {agSelecionado.hora_fim.slice(0, 5)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <DollarSign className="w-5 h-5 text-dourado shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-verde_petroleo">Valor Total do Serviço</p>
                    <p className="font-serif font-bold text-verde_escuro text-base">R$ {agSelecionado.valor.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {agSelecionado.observacao && (
                <div className="pt-3 border-t border-bege_borda">
                  <p className="font-semibold text-xs text-texto_secundario uppercase mb-1">Observações do Cliente</p>
                  <p className="text-xs text-texto_principal bg-marfim p-3 rounded-lg italic">
                    &quot;{agSelecionado.observacao}&quot;
                  </p>
                </div>
              )}
            </div>

            {/* Ações */}
            <div className="flex gap-3 pt-4 border-t border-bege_borda mt-6">
              {agSelecionado.status !== "cancelado" && agSelecionado.status !== "concluido" && (
                <button
                  onClick={() => cancelarAgendamento(agSelecionado.id)}
                  className="botao-perigo flex-1 py-2 text-xs"
                >
                  Cancelar Agendamento
                </button>
              )}
              <button
                onClick={() => setAgSelecionado(null)}
                className="botao-secundario flex-1 py-2 text-xs"
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
