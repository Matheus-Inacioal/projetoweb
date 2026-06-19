"use client";

import { useState, useEffect } from "react";
import { useBuscarDados } from "@/hooks/useBuscarDados";
import { EstadoCarregando } from "@/componentes/feedback/EstadoCarregando";
import { EstadoErro } from "@/componentes/feedback/EstadoErro";
import { EstadoVazio } from "@/componentes/feedback/EstadoVazio";
import { Botao } from "@/componentes/ui/Botao";
import { CampoTexto } from "@/componentes/ui/CampoTexto";
import { AreaTexto } from "@/componentes/ui/AreaTexto";
import { formatarData, formatarMoeda } from "@/lib/utilitarios/datas";
import toast, { Toaster } from "react-hot-toast";
import { 
  Calendar, 
  Clock, 
  Check, 
  X, 
  AlertTriangle, 
  MessageSquare, 
  History, 
  User, 
  DollarSign, 
  Scissors 
} from "lucide-react";

const abas = [
  { id: "pendentes", label: "Pendentes", status: ["pendente"] },
  { id: "confirmados", label: "Confirmados", status: ["confirmado", "remarcado"] },
  { id: "remarcacoes", label: "Remarcações", status: ["remarcacao_solicitada"] },
  { id: "concluidos", label: "Concluídos", status: ["concluido"] },
  { id: "cancelados", label: "Cancelados/Recusados", status: ["cancelado", "recusado"] }
];

export default function GerenciadorAgendamentosPrestador() {
  const [abaAtiva, setAbaAtiva] = useState("pendentes");
  const [visualizandoHistoricoId, setVisualizandoHistoricoId] = useState<string | null>(null);
  
  // States para o modal de remarcação
  const [remarcandoAg, setRemarcandoAg] = useState<any | null>(null);
  const [dataRemarcacao, setDataRemarcacao] = useState("");
  const [slotSelecionado, setSlotSelecionado] = useState<any | null>(null);
  const [motivoRemarcacao, setMotivoRemarcacao] = useState("");
  const [submetendoRemarcacao, setSubmetendoRemarcacao] = useState(false);

  // Perfil do prestador logado
  const { dados: prestador, carregando: cPrestador } = useBuscarDados<any>("/api/prestadores/me");
  
  // Listagem de contratações do prestador
  const { dados: contratacoes, carregando: cContratacoes, erro, recarregar } = 
    useBuscarDados<any[]>("/api/contratacoes");

  // Busca slots de agenda para remarcação
  const urlSlots = dataRemarcacao && prestador 
    ? `/api/agenda?prestadorId=${prestador.id}&data=${dataRemarcacao}&disponivel=true` 
    : null;
  const { dados: slotsDisponiveis, carregando: cSlots } = useBuscarDados<any[]>(urlSlots);

  // Limpa slot selecionado ao mudar a data de remarcação
  useEffect(() => {
    setSlotSelecionado(null);
  }, [dataRemarcacao]);

  async function handleMudarStatus(id: string, acao: string, extraBody?: any) {
    try {
      const response = await fetch(`/api/contratacoes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ acao, ...extraBody })
      });
      const data = await response.json();
      if (response.ok && data.sucesso) {
        toast.success(data.mensagem || "Ação executada com sucesso!");
        recarregar();
      } else {
        toast.error(data.mensagem || "Erro ao processar ação.");
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Erro na comunicação com o servidor.");
    }
  }

  async function handleRecusar(id: string) {
    const motivo = prompt("Por favor, digite o motivo da recusa:");
    if (motivo === null) return; // cancelado pelo prestador
    if (!motivo.trim()) {
      toast.error("O motivo da recusa é obrigatório.");
      return;
    }
    await handleMudarStatus(id, "recusar", { observacao: motivo });
  }

  async function handleConcluir(id: string) {
    if (!confirm("Deseja marcar este atendimento como Concluído?")) return;
    try {
      const response = await fetch(`/api/contratacoes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "concluido", observacao: "Atendimento concluído com sucesso." })
      });
      const data = await response.json();
      if (response.ok && data.sucesso) {
        toast.success("Atendimento concluído!");
        recarregar();
      } else {
        toast.error(data.mensagem || "Erro ao concluir atendimento.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Erro na comunicação com o servidor.");
    }
  }

  async function handleCancelar(id: string) {
    const motivo = prompt("Por favor, digite o motivo do cancelamento:");
    if (motivo === null) return;
    await handleMudarStatus(id, "cancelar", { status: "cancelado", observacao: motivo || "Cancelado pelo prestador." });
  }

  async function handleEnviarRemarcacao(e: React.FormEvent) {
    e.preventDefault();
    if (!remarcandoAg || !slotSelecionado) return;
    setSubmetendoRemarcacao(true);

    try {
      const response = await fetch(`/api/contratacoes/${remarcandoAg.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          acao: "remarcar",
          novaAgendaId: slotSelecionado.id,
          observacao: motivoRemarcacao
        })
      });
      const data = await response.json();
      if (response.ok && data.sucesso) {
        toast.success("Solicitação de remarcação enviada!");
        // Limpar estados
        fecharModalRemarcacao();
        recarregar();
      } else {
        toast.error(data.mensagem || "Erro ao solicitar remarcação.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Erro ao processar solicitação.");
    } finally {
      setSubmetendoRemarcacao(false);
    }
  }

  function abrirModalRemarcacao(agendamento: any) {
    setRemarcandoAg(agendamento);
    setDataRemarcacao("");
    setSlotSelecionado(null);
    setMotivoRemarcacao("");
  }

  function fecharModalRemarcacao() {
    setRemarcandoAg(null);
    setDataRemarcacao("");
    setSlotSelecionado(null);
    setMotivoRemarcacao("");
  }

  if (cPrestador || cContratacoes) {
    return <EstadoCarregando texto="Carregando gerenciador de contratações..." />;
  }

  if (erro) {
    return <EstadoErro mensagem={erro} onTentarNovamente={recarregar} />;
  }

  // Filtra as contratações baseadas na aba ativa
  const statusFiltrados = abas.find(a => a.id === abaAtiva)?.status || [];
  const filtradas = (contratacoes || []).filter(c => statusFiltrados.includes(c.status));

  return (
    <div className="container-pagina py-10 space-y-8">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white border border-bege_borda p-6 rounded-3xl shadow-suave">
        <div className="space-y-1">
          <p className="texto-destaque">Área do Prestador</p>
          <h1 className="text-3xl font-serif font-bold text-verde_petroleo">Gerenciador de Contratações</h1>
          <p className="text-xs text-texto_secundario">Administre seus agendamentos, aprove solicitações e controle propostas de remarcação.</p>
        </div>
        <div className="flex items-center gap-3 bg-marfim border border-bege_borda p-3 rounded-2xl">
          <div className="h-10 w-10 rounded-full overflow-hidden bg-bege_borda border border-dourado">
            {prestador?.fotoUrl ? (
              <img src={prestador.fotoUrl} alt={prestador.nome} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center font-bold text-verde_petroleo">
                {prestador?.nome?.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <p className="text-xs font-bold text-texto_principal leading-tight">{prestador?.nome}</p>
            <p className="text-[10px] text-dourado uppercase tracking-wider font-semibold">{prestador?.especialidade || "Barbeiro"}</p>
          </div>
        </div>
      </div>

      {/* Navegação de Abas */}
      <div className="flex flex-wrap gap-2 border-b border-bege_borda pb-1 overflow-x-auto">
        {abas.map((aba) => {
          const count = (contratacoes || []).filter(c => aba.status.includes(c.status)).length;
          return (
            <button
              key={aba.id}
              onClick={() => setAbaAtiva(aba.id)}
              className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${
                abaAtiva === aba.id
                  ? "border-dourado text-dourado bg-marfim"
                  : "border-transparent text-texto_secundario hover:text-texto_principal"
              }`}
            >
              {aba.label}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                abaAtiva === aba.id ? "bg-dourado text-white" : "bg-bege_borda text-texto_secundario"
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Lista de Contratações */}
      <div className="space-y-4">
        {filtradas.length > 0 ? (
          filtradas.map((c) => (
            <div 
              key={c.id} 
              className="cartao p-6 bg-white border border-bege_borda flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-suave transition-all"
            >
              <div className="space-y-3 flex-1">
                {/* Cabeçalho do Card */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1.5 text-sm font-bold text-texto_principal bg-marfim px-2.5 py-1 rounded-lg border border-bege_borda">
                    <User className="h-4 w-4 text-dourado" />
                    {c.consumidorNome}
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase ${
                    c.status === "pendente" ? "bg-yellow-100 text-yellow-800" :
                    c.status === "confirmado" ? "bg-green-100 text-green-800" :
                    c.status === "remarcado" ? "bg-blue-100 text-blue-800" :
                    c.status === "remarcacao_solicitada" ? "bg-orange-100 text-orange-800" :
                    c.status === "concluido" ? "bg-teal-100 text-teal-800" :
                    "bg-gray-100 text-gray-800"
                  }`}>
                    {c.status}
                  </span>
                </div>

                {/* Detalhes do Serviço */}
                <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 text-xs text-texto_secundario">
                  <div className="flex items-center gap-1.5">
                    <Scissors className="h-3.5 w-3.5 text-verde_petroleo" />
                    <span><strong>Serviço:</strong> {c.servicoNome}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="h-3.5 w-3.5 text-verde_petroleo" />
                    <span><strong>Preço:</strong> {formatarMoeda(c.valor)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-verde_petroleo" />
                    <span><strong>Horário:</strong> {c.data ? formatarData(c.data) : "Não informada"} às {c.horario || ""}</span>
                  </div>
                </div>

                {/* E-mail de Contato */}
                {c.consumidorEmail && (
                  <p className="text-[11px] text-texto_secundario">📧 Email: {c.consumidorEmail}</p>
                )}

                {/* Observações */}
                {c.observacao && (
                  <div className="p-3 bg-marfim border border-bege_borda rounded-xl text-xs italic text-texto_secundario flex items-start gap-1.5">
                    <MessageSquare className="h-3.5 w-3.5 text-dourado shrink-0 mt-0.5" />
                    <div>
                      <strong>Observações:</strong> {c.observacao}
                    </div>
                  </div>
                )}

                {/* Resumo da Remarcação Pendente se aplicável */}
                {c.status === "remarcacao_solicitada" && c.propostaRemarcacao && (
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-xl text-xs text-orange-950 space-y-1">
                    <p className="font-semibold text-orange-800 flex items-center gap-1">
                      <span>⏰</span> Proposta de remarcação enviada por você:
                    </p>
                    <p><strong>Novo Horário sugerido:</strong> {formatarData(c.propostaRemarcacao.data)} às {c.propostaRemarcacao.horario}</p>
                    {c.propostaRemarcacao.motivo && <p><strong>Motivo da alteração:</strong> {c.propostaRemarcacao.motivo}</p>}
                  </div>
                )}
              </div>

              {/* Botões de Ação */}
              <div className="flex flex-wrap md:flex-col gap-2 shrink-0 justify-end md:justify-center md:items-end">
                {/* Ações Pendentes */}
                {c.status === "pendente" && (
                  <>
                    <button
                      onClick={() => handleMudarStatus(c.id, "aprovar")}
                      className="px-3.5 py-2 text-xs font-bold rounded-xl bg-green-600 hover:bg-green-700 text-white flex items-center gap-1.5 shadow-sm transition"
                    >
                      <Check className="h-3.5 w-3.5" /> Aceitar
                    </button>
                    <button
                      onClick={() => abrirModalRemarcacao(c)}
                      className="px-3.5 py-2 text-xs font-bold rounded-xl bg-dourado hover:bg-opacity-95 text-white flex items-center gap-1.5 shadow-sm transition"
                    >
                      <Calendar className="h-3.5 w-3.5" /> Propor Alteração
                    </button>
                    <button
                      onClick={() => handleRecusar(c.id)}
                      className="px-3.5 py-2 text-xs font-bold rounded-xl border border-red-200 hover:bg-red-50 text-red-600 flex items-center gap-1.5 transition"
                    >
                      <X className="h-3.5 w-3.5" /> Recusar
                    </button>
                  </>
                )}

                {/* Ações Confirmadas */}
                {(c.status === "confirmado" || c.status === "remarcado") && (
                  <>
                    <button
                      onClick={() => handleConcluir(c.id)}
                      className="px-3.5 py-2 text-xs font-bold rounded-xl bg-verde_petroleo hover:bg-opacity-95 text-white flex items-center gap-1.5 shadow-sm transition"
                    >
                      <Check className="h-3.5 w-3.5" /> Concluir Atendimento
                    </button>
                    <button
                      onClick={() => abrirModalRemarcacao(c)}
                      className="px-3.5 py-2 text-xs font-bold rounded-xl bg-dourado hover:bg-opacity-95 text-white flex items-center gap-1.5 shadow-sm transition"
                    >
                      <Calendar className="h-3.5 w-3.5" /> Remarcar Horário
                    </button>
                    <button
                      onClick={() => handleCancelar(c.id)}
                      className="px-3.5 py-2 text-xs font-bold rounded-xl border border-red-200 hover:bg-red-50 text-red-600 flex items-center gap-1.5 transition"
                    >
                      <X className="h-3.5 w-3.5" /> Cancelar
                    </button>
                  </>
                )}

                {/* Ações para Remarcação Pendente */}
                {c.status === "remarcacao_solicitada" && (
                  <>
                    <button
                      onClick={() => abrirModalRemarcacao(c)}
                      className="px-3.5 py-2 text-xs font-bold rounded-xl bg-dourado hover:bg-opacity-95 text-white flex items-center gap-1.5 transition"
                    >
                      <Calendar className="h-3.5 w-3.5" /> Alterar Proposta
                    </button>
                    <button
                      onClick={() => handleCancelar(c.id)}
                      className="px-3.5 py-2 text-xs font-bold rounded-xl border border-red-200 hover:bg-red-50 text-red-600 flex items-center gap-1.5 transition"
                    >
                      <X className="h-3.5 w-3.5" /> Cancelar Agendamento
                    </button>
                  </>
                )}

                {/* Auditoria / Histórico Geral */}
                <button
                  onClick={() => setVisualizandoHistoricoId(c.id)}
                  className="px-3.5 py-2 text-xs font-bold rounded-xl border border-bege_borda hover:bg-marfim text-texto_principal flex items-center gap-1.5 transition"
                >
                  <History className="h-3.5 w-3.5 text-dourado" /> Histórico & Auditoria
                </button>
              </div>
            </div>
          ))
        ) : (
          <EstadoVazio 
            titulo="Nenhuma contratação encontrada" 
            descricao={`Não há agendamentos nesta aba no momento.`} 
          />
        )}
      </div>

      {/* Timeline Modal de Auditoria */}
      {visualizandoHistoricoId && (
        <HistoricoTimelineModal 
          contratacaoId={visualizandoHistoricoId} 
          onClose={() => setVisualizandoHistoricoId(null)} 
        />
      )}

      {/* Modal de Remarcação */}
      {remarcandoAg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity">
          <div className="bg-white border border-bege_borda rounded-3xl max-w-lg w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={fecharModalRemarcacao} 
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-marfim text-texto_secundario hover:text-texto_principal transition"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-xl font-serif font-bold text-verde_petroleo mb-1 flex items-center gap-1.5">
              <Calendar className="h-5 w-5 text-dourado" /> Sugerir Remarcação
            </h3>
            <p className="text-xs text-texto_secundario border-b border-bege_borda pb-3 mb-4">
              Cliente: <strong className="text-texto_principal">{remarcandoAg.consumidorNome}</strong> • Serviço: {remarcandoAg.servicoNome}
            </p>

            <form onSubmit={handleEnviarRemarcacao} className="space-y-5">
              {/* Data */}
              <label className="block space-y-1.5">
                <span className="block text-xs font-bold text-texto_principal">Selecione a Nova Data</span>
                <input 
                  type="date"
                  value={dataRemarcacao}
                  onChange={(e) => setDataRemarcacao(e.target.value)}
                  className="campo-base bg-white w-full border-bege_borda text-xs"
                  required
                />
              </label>

              {/* Horários da Data Selecionada */}
              {dataRemarcacao && (
                <div className="space-y-1.5">
                  <span className="block text-xs font-bold text-texto_principal">Horários Livres da Sua Agenda</span>
                  {cSlots ? (
                    <p className="text-xs text-texto_secundario animate-pulse">Carregando horários...</p>
                  ) : slotsDisponiveis && slotsDisponiveis.length > 0 ? (
                    <div className="grid grid-cols-4 gap-2 max-h-36 overflow-y-auto p-1 border border-bege_borda rounded-xl">
                      {slotsDisponiveis.map((slot) => (
                        <button
                          key={slot.id}
                          type="button"
                          onClick={() => setSlotSelecionado(slot)}
                          className={`p-2 text-[10px] font-bold rounded-lg border text-center transition ${
                            slotSelecionado?.id === slot.id
                              ? "bg-verde_petroleo text-white border-verde_petroleo"
                              : "bg-white border-bege_borda text-texto_principal hover:border-dourado"
                          }`}
                        >
                          {slot.hora_inicio?.slice(0, 5) || '--:--'}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-red-600 flex items-center gap-1">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                      Não há horários ativos cadastrados ou livres para este dia na sua agenda.
                    </p>
                  )}
                </div>
              )}

              {/* Detalhes do horário selecionado */}
              {slotSelecionado && (
                <div className="p-3 bg-marfim border border-bege_borda rounded-xl text-xs text-texto_principal">
                  📌 Proposta: <span className="font-bold">{formatarData(dataRemarcacao)}</span> às <span className="font-bold">{slotSelecionado.hora_inicio?.slice(0, 5) || '--:--'}</span>
                </div>
              )}

              {/* Motivo */}
              <AreaTexto
                label="Motivo da Remarcação (Explicar ao Cliente)"
                id="reschedule-reason"
                placeholder="Por favor, explique o motivo da alteração de data/hora..."
                value={motivoRemarcacao}
                onChange={(e) => setMotivoRemarcacao(e.target.value)}
                required
                className="bg-white text-xs"
              />

              {/* Botoes */}
              <div className="flex gap-2 justify-end pt-2 border-t border-bege_borda">
                <button
                  type="button"
                  onClick={fecharModalRemarcacao}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-bege_borda hover:bg-marfim text-texto_principal"
                >
                  Cancelar
                </button>
                <Botao 
                  type="submit" 
                  disabled={submetendoRemarcacao || !slotSelecionado || !motivoRemarcacao.trim()}
                  className="px-4 py-2 text-xs"
                >
                  {submetendoRemarcacao ? "Processando..." : "Enviar Proposta"}
                </Botao>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function HistoricoTimelineModal({ contratacaoId, onClose }: { contratacaoId: string; onClose: () => void }) {
  const { dados: logs, carregando, erro } = useBuscarDados<any[]>(`/api/contratacoes/${contratacaoId}/historico`);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity">
      <div className="bg-white border border-bege_borda rounded-3xl max-w-xl w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-marfim text-texto_secundario hover:text-texto_principal transition"
        >
          <X className="h-5 w-5" />
        </button>

        <h3 className="text-xl font-serif font-bold text-verde_petroleo mb-1 flex items-center gap-1.5">
          <History className="h-5 w-5 text-dourado" /> Histórico de Auditoria & Alterações
        </h3>
        <p className="text-xs text-texto_secundario border-b border-bege_borda pb-3 mb-5">
          Audite o ciclo de vida deste agendamento passo a passo.
        </p>

        {carregando ? (
          <EstadoCarregando texto="Carregando logs..." />
        ) : erro ? (
          <EstadoErro mensagem={erro} />
        ) : logs && logs.length > 0 ? (
          <div className="relative border-l-2 border-bege_borda pl-5 ml-2.5 max-h-96 overflow-y-auto space-y-6">
            {logs.map((log) => (
              <div key={log.id} className="relative">
                {/* Indicador de Bolinha da Linha do Tempo */}
                <div className="absolute -left-[27px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-bege_borda bg-dourado shadow-sm"></div>
                
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="font-bold text-texto_principal text-sm">{log.acao}</span>
                    <span className="text-[10px] text-texto_secundario">{new Date(log.createdAt).toLocaleString("pt-BR")}</span>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-texto_secundario">
                    <span><strong>Por:</strong> {log.usuarioNome}</span>
                    <span>•</span>
                    <span><strong>De:</strong> <span className="bg-gray-100 px-1 py-0.5 rounded text-gray-700">{log.statusAnterior || "nenhum"}</span></span>
                    <span>➡️</span>
                    <span><strong>Para:</strong> <span className="bg-marfim px-1 py-0.5 rounded text-dourado font-medium">{log.statusNovo}</span></span>
                  </div>

                  {log.observacao && (
                    <p className="text-xs text-texto_secundario italic bg-marfim border border-bege_borda p-2 rounded-xl mt-1 leading-relaxed">
                      💬 &quot;{log.observacao}&quot;
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EstadoVazio titulo="Nenhum log registrado" descricao="Não há histórico de auditoria registrado para esta contratação." />
        )}

        <div className="flex justify-end pt-4 border-t border-bege_borda mt-5">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl border border-bege_borda hover:bg-marfim text-texto_principal transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
