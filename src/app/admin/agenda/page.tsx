"use client";

import { useState, useEffect } from "react";
import { criarClienteSupabaseNavegador } from "@/lib/banco/supabase-client";
import { EstadoCarregando } from "@/componentes/feedback/EstadoCarregando";
import { Calendar as CalendarIcon, Clock, Plus, Filter, Ban, CheckCircle, Trash2, X, Percent } from "lucide-react";
import toast from "react-hot-toast";

interface AgendaSlot {
  id: string;
  prestador_id: string;
  data: string;
  hora_inicio: string;
  hora_fim: string;
  disponivel: boolean;
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

export default function AgendaAdminPage() {
  const [slots, setSlots] = useState<AgendaSlot[]>([]);
  const [prestadores, setPrestadores] = useState<PrestadorDropdown[]>([]);
  const [carregando, setCarregando] = useState(true);
  
  // Filters
  const [filtroPrestador, setFiltroPrestador] = useState("todos");
  const [filtroData, setFiltroData] = useState("");

  // Create slot form state
  const [modalAberto, setModalAberto] = useState(false);
  const [formPrestadorId, setFormPrestadorId] = useState("");
  const [formData, setFormData] = useState("");
  const [formHoraInicio, setFormHoraInicio] = useState("09:00");
  const [formHoraFim, setFormHoraFim] = useState("09:45");
  const [salvando, setSalvando] = useState(false);

  const supabase = criarClienteSupabaseNavegador();

  const abrirNovo = () => {
    setFormData("");
    setFormHoraInicio("09:00");
    setFormHoraFim("09:45");
    setModalAberto(true);
  };

  const carregarDados = async () => {
    try {
      setCarregando(true);

      // Carrega prestadores
      const { data: pData, error: pErr } = await supabase
        .from("prestadores")
        .select("id, usuarios(nome)");
      if (pErr) throw pErr;
      
      const parsedPrestadores = (pData || []).map((p: any) => ({
        id: p.id,
        nome: p.usuarios?.nome || "Barbeiro"
      }));
      setPrestadores(parsedPrestadores);
      if (parsedPrestadores.length > 0 && !formPrestadorId) {
        setFormPrestadorId(parsedPrestadores[0].id);
      }

      // Carrega agenda
      const { data: aData, error: aErr } = await supabase
        .from("agenda")
        .select("*, prestadores(usuarios(nome))")
        .order("data", { ascending: true })
        .order("hora_inicio", { ascending: true });
      if (aErr) throw aErr;
      
      setSlots((aData as any) || []);
    } catch (err: any) {
      toast.error("Erro ao carregar agenda: " + err.message);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const alternarDisponibilidade = async (id: string, disponivelAtual: boolean) => {
    try {
      const { error } = await supabase
        .from("agenda")
        .update({ disponivel: !disponivelAtual })
        .eq("id", id);
      if (error) throw error;

      setSlots(slots.map(s => s.id === id ? { ...s, disponivel: !disponivelAtual } : s));
      toast.success(disponivelAtual ? "Horário bloqueado com sucesso!" : "Horário liberado com sucesso!");
    } catch (err: any) {
      toast.error("Erro ao atualizar horário: " + err.message);
    }
  };

  const excluirSlot = async (id: string) => {
    if (!confirm("Deseja realmente remover este horário da agenda?")) return;
    try {
      const { error } = await supabase
        .from("agenda")
        .delete()
        .eq("id", id);
      if (error) throw error;

      setSlots(slots.filter(s => s.id !== id));
      toast.success("Horário excluído!");
    } catch (err: any) {
      toast.error("Erro ao excluir: " + err.message);
    }
  };

  const criarHorario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPrestadorId || !formData || !formHoraInicio || !formHoraFim) {
      toast.error("Preencha todos os campos.");
      return;
    }

    try {
      setSalvando(true);
      const { error } = await supabase
        .from("agenda")
        .insert({
          prestador_id: formPrestadorId,
          data: formData,
          hora_inicio: formHoraInicio + ":00",
          hora_fim: formHoraFim + ":00",
          disponivel: true
        });

      if (error) throw error;
      toast.success("Horário aberto na agenda!");
      setModalAberto(false);
      carregarDados();
    } catch (err: any) {
      toast.error("Erro ao abrir horário: " + err.message);
    } finally {
      setSalvando(false);
    }
  };

  const filtrados = slots.filter(s => {
    const matchesPrestador = filtroPrestador === "todos" || s.prestador_id === filtroPrestador;
    const matchesData = !filtroData || s.data === filtroData;
    return matchesPrestador && matchesData;
  });

  // Stats
  const totalSlots = filtrados.length;
  const slotsOcupados = filtrados.filter(s => !s.disponivel).length;
  const taxaOcupacao = totalSlots > 0 ? (slotsOcupados / totalSlots) * 100 : 0;

  const formatarData = (dataSql: string) => {
    if (!dataSql) return "";
    const [ano, mes, dia] = dataSql.split("-");
    return `${dia}/${mes}/${ano}`;
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="texto-destaque mb-1">Módulos de Controle</p>
          <h1 className="text-3xl font-serif font-bold text-verde_petroleo">Agenda & Ocupação</h1>
          <p className="text-sm text-texto_secundario">Controle o quadro de horários disponíveis, bloqueie agendas ou abra novos turnos.</p>
        </div>
        <button
          onClick={abrirNovo}
          className="botao-premium flex items-center justify-center gap-1.5 self-start py-2.5 px-4 font-bold"
        >
          <Plus className="w-5 h-5" />
          Abrir Horário
        </button>
      </div>

      {/* Cartões Estatísticos da Agenda */}
      <div className="grid gap-6 sm:grid-cols-3">
        <div className="cartao p-6 flex items-center gap-4">
          <div className="p-3 bg-verde_petroleo/5 rounded-xl text-verde_petroleo">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-texto_secundario">Total de Horários</p>
            <p className="text-2xl font-bold text-primaria mt-1">{totalSlots} slots</p>
          </div>
        </div>

        <div className="cartao p-6 flex items-center gap-4">
          <div className="p-3 bg-dourado/10 rounded-xl text-dourado">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-texto_secundario">Reservados / Ocupados</p>
            <p className="text-2xl font-bold text-primaria mt-1">{slotsOcupados} slots</p>
          </div>
        </div>

        <div className="cartao p-6 flex items-center gap-4">
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-700">
            <Percent className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-texto_secundario">Taxa de Ocupação</p>
            <p className="text-2xl font-bold text-emerald-700 mt-1">{taxaOcupacao.toFixed(1)}%</p>
          </div>
        </div>
      </div>

      {/* Painel de Filtros */}
      <div className="flex flex-col md:flex-row gap-4 items-center bg-off_white p-4 rounded-xl border border-bege_borda shadow-suave">
        <div className="flex items-center gap-2 w-full md:flex-1">
          <Filter className="w-4 h-4 text-texto_secundario shrink-0" />
          <select
            className="campo-base py-2"
            value={filtroPrestador}
            onChange={(e) => setFiltroPrestador(e.target.value)}
          >
            <option value="todos">Todos os Barbeiros</option>
            {prestadores.map(p => (
              <option key={p.id} value={p.id}>{p.nome}</option>
            ))}
          </select>
        </div>

        <div className="w-full md:w-64">
          <input
            type="date"
            className="campo-base py-2"
            value={filtroData}
            onChange={(e) => setFiltroData(e.target.value)}
          />
        </div>
        
        {filtroData && (
          <button
            onClick={() => setFiltroData("")}
            className="text-xs text-rose-600 font-semibold hover:underline"
          >
            Limpar data
          </button>
        )}
      </div>

      {/* Listagem de Horários */}
      {carregando ? (
        <EstadoCarregando texto="Buscando disponibilidade..." />
      ) : (
        <div className="cartao overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-verde_petroleo/5 border-b border-bege_borda text-xs font-semibold text-verde_petroleo uppercase tracking-wider">
                <th className="p-4">Barbeiro</th>
                <th className="p-4">Data</th>
                <th className="p-4">Início</th>
                <th className="p-4">Término</th>
                <th className="p-4">Disponibilidade</th>
                <th className="p-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bege_borda text-sm text-texto_principal">
              {filtrados.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-texto_secundario font-medium">
                    Nenhum horário aberto encontrado na agenda para os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filtrados.map((s) => (
                  <tr key={s.id} className="hover:bg-bege_borda/10 transition">
                    <td className="p-4 font-semibold text-verde_petroleo">
                      {s.prestadores?.usuarios?.nome || "Barbeiro"}
                    </td>
                    <td className="p-4 text-texto_secundario font-medium">
                      {formatarData(s.data)}
                    </td>
                    <td className="p-4 text-texto_secundario">{s.hora_inicio.slice(0, 5)}</td>
                    <td className="p-4 text-texto_secundario">{s.hora_fim.slice(0, 5)}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        s.disponivel ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                      }`}>
                        {s.disponivel ? "Livre / Disponível" : "Bloqueado / Reservado"}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => alternarDisponibilidade(s.id, s.disponivel)}
                          className={`p-1.5 rounded transition ${
                            s.disponivel 
                              ? "text-amber-600 hover:bg-amber-50" 
                              : "text-emerald-600 hover:bg-emerald-50"
                          }`}
                          title={s.disponivel ? "Bloquear horário" : "Liberar horário"}
                        >
                          {s.disponivel ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => excluirSlot(s.id)}
                          className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded transition"
                          title="Excluir Horário"
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

      {/* Modal Criar Slot */}
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
              <CalendarIcon className="w-5 h-5 text-dourado" />
              Abrir Novo Horário
            </h2>

            <form onSubmit={criarHorario} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-texto_secundario uppercase mb-1.5">
                  Barbeiro *
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
                  Data *
                </label>
                <input
                  type="date"
                  required
                  className="campo-base"
                  value={formData}
                  onChange={(e) => setFormData(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-texto_secundario uppercase mb-1.5">
                    Hora de Início *
                  </label>
                  <input
                    type="time"
                    required
                    className="campo-base"
                    value={formHoraInicio}
                    onChange={(e) => setFormHoraInicio(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-texto_secundario uppercase mb-1.5">
                    Hora de Término *
                  </label>
                  <input
                    type="time"
                    required
                    className="campo-base"
                    value={formHoraFim}
                    onChange={(e) => setFormHoraFim(e.target.value)}
                  />
                </div>
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
                  {salvando ? "Salvando..." : "Abrir Horário"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
