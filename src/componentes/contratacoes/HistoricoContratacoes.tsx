"use client";

import { useBuscarDados } from "@/hooks/useBuscarDados";
import { EstadoCarregando } from "@/componentes/feedback/EstadoCarregando";
import { EstadoErro } from "@/componentes/feedback/EstadoErro";
import { EstadoVazio } from "@/componentes/feedback/EstadoVazio";
import { formatarMoeda, formatarData } from "@/lib/utilitarios/datas";

export function HistoricoContratacoes() {
  const { dados: agendamentos, carregando, erro, recarregar } = useBuscarDados<any[]>("/api/contratacoes");

  async function handleCancelar(id: string) {
    if (!confirm("Deseja realmente cancelar este agendamento?")) return;
    try {
      const response = await fetch(`/api/contratacoes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelado" })
      });
      if (response.ok) {
        recarregar();
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleResponderRemarcacao(id: string, aceito: boolean) {
    const acaoLabel = aceito ? "aceitar" : "recusar";
    if (!confirm(`Deseja realmente ${acaoLabel} esta proposta de remarcação?` + (!aceito ? " O agendamento será cancelado." : ""))) return;
    try {
      const response = await fetch(`/api/contratacoes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ acao: "responder_remarcacao", aceito })
      });
      if (response.ok) {
        recarregar();
      }
    } catch (err) {
      console.error(err);
    }
  }

  if (carregando) return <EstadoCarregando texto="Carregando agendamentos..." />;
  if (erro) return <EstadoErro mensagem={erro} onTentarNovamente={recarregar} />;

  return (
    <div className="space-y-6">
      {agendamentos && agendamentos.length > 0 ? (
        <div className="space-y-4">
          {agendamentos.map((c) => (
            <div key={c.id} className="cartao p-6 bg-white border border-bege_borda flex flex-col gap-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="font-serif font-bold text-lg text-texto_principal">{c.prestadorNome}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      c.status === "pendente" && "bg-yellow-100 text-yellow-800"
                    } ${
                      c.status === "confirmado" && "bg-green-100 text-green-800"
                    } ${
                      c.status === "remarcado" && "bg-blue-100 text-blue-800"
                    } ${
                      c.status === "remarcacao_solicitada" && "bg-orange-100 text-orange-800"
                    } ${
                      c.status === "concluido" && "bg-teal-100 text-teal-800"
                    } ${
                      c.status === "recusado" && "bg-red-100 text-red-800"
                    } ${
                      c.status === "cancelado" && "bg-gray-100 text-gray-800"
                    }`}>
                      {c.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-dourado uppercase tracking-wider">{c.prestadorEspecialidade || "Geral"}</p>
                  <p className="text-sm text-texto_secundario">
                    ✂️ <span className="font-medium text-texto_principal">{c.servicoNome}</span> • 💰 {formatarMoeda(c.valor)}
                  </p>
                  <p className="text-xs text-texto_secundario">
                    📅 Data: {c.data ? formatarData(c.data) : "Não informada"} às {c.horario || ""}
                  </p>
                  {c.observacao && c.status !== "remarcacao_solicitada" && (
                    <p className="text-xs italic bg-marfim p-2 rounded text-texto_secundario">
                      💬 Obs: {c.observacao}
                    </p>
                  )}
                </div>

                {(c.status === "pendente" || c.status === "confirmado" || c.status === "remarcado") && (
                  <button
                    onClick={() => handleCancelar(c.id)}
                    className="botao-secundario text-xs text-red-600 border-red-200 hover:bg-red-50 py-2 px-4 rounded-xl self-start md:self-center"
                  >
                    Cancelar Agendamento
                  </button>
                )}
              </div>

              {c.status === "remarcacao_solicitada" && c.propostaRemarcacao && (
                <div className="p-4 rounded-xl border border-orange-200 bg-orange-50 space-y-3">
                  <p className="text-sm font-semibold text-orange-800 flex items-center gap-1.5">
                    <span>🗓️</span> O prestador sugeriu um novo horário:
                  </p>
                  <div className="text-xs text-orange-950 space-y-1.5">
                    <p><strong>Nova Data/Hora:</strong> {formatarData(c.propostaRemarcacao.data)} às {c.propostaRemarcacao.horario}</p>
                    {c.propostaRemarcacao.motivo && <p><strong>Motivo da Alteração:</strong> {c.propostaRemarcacao.motivo}</p>}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleResponderRemarcacao(c.id, true)}
                      className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium text-xs transition"
                    >
                      Aceitar Horário
                    </button>
                    <button
                      onClick={() => handleResponderRemarcacao(c.id, false)}
                      className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium text-xs transition"
                    >
                      Recusar & Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <EstadoVazio
          titulo="Nenhum agendamento realizado"
          descricao="Você ainda não agendou nenhum serviço com nossos profissionais."
        />
      )}
    </div>
  );
}
