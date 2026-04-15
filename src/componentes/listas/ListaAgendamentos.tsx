"use client";

import { useState } from "react";
import { formatarData, formatarMoeda } from "@/lib/utilitarios/datas";
import type { AgendamentoDetalhado, RespostaApi } from "@/tipos/dados";
import { IndicadorStatus } from "@/componentes/ui/IndicadorStatus";
import { Botao } from "@/componentes/ui/Botao";
import { MensagemRetorno } from "@/componentes/feedback/MensagemRetorno";

export function ListaAgendamentos({
  agendamentos,
  permitirCancelamento = false,
  onAtualizado
}: {
  agendamentos: AgendamentoDetalhado[];
  permitirCancelamento?: boolean;
  onAtualizado?: () => void;
}) {
  const [agendamentoAtivo, setAgendamentoAtivo] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [mensagemErro, setMensagemErro] = useState<string | null>(null);

  async function cancelarAgendamento(agendamentoId: string) {
    setAgendamentoAtivo(agendamentoId);
    setCarregando(true);
    setMensagemErro(null);

    const resposta = await fetch(`/api/agendamentos/${agendamentoId}/cancelar`, {
      method: "PATCH",
      credentials: "include"
    });

    const conteudo = (await resposta.json()) as RespostaApi<AgendamentoDetalhado | null>;

    if (!resposta.ok || !conteudo.sucesso) {
      setMensagemErro(conteudo.mensagem || "Nao foi possivel cancelar o agendamento.");
      setCarregando(false);
      return;
    }

    setCarregando(false);
    onAtualizado?.();
  }

  return (
    <div className="space-y-4">
      {mensagemErro ? <MensagemRetorno mensagem={mensagemErro} tipo="erro" /> : null}
      {agendamentos.map((agendamento) => (
        <article className="cartao p-5" key={agendamento.id}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-lg font-semibold text-slate-900">{agendamento.servicoNome}</h3>
                <IndicadorStatus status={agendamento.status} />
              </div>
              <p className="text-sm text-slate-600">
                {agendamento.barbeariaNome} • {agendamento.barbeiroNome}
              </p>
              <p className="text-sm text-slate-600">
                {formatarData(agendamento.data)} as {agendamento.hora}
              </p>
              <p className="text-sm text-slate-600">
                Contratante: {agendamento.contratanteNome} • Valor: {formatarMoeda(agendamento.precoServico)}
              </p>
              {agendamento.observacao ? <p className="text-sm text-slate-600">Obs.: {agendamento.observacao}</p> : null}
            </div>

            {permitirCancelamento && agendamento.status !== "CANCELADO" && agendamento.status !== "CONCLUIDO" ? (
              <Botao
                disabled={carregando && agendamentoAtivo === agendamento.id}
                onClick={() => void cancelarAgendamento(agendamento.id)}
                type="button"
                variante="perigo"
              >
                {carregando && agendamentoAtivo === agendamento.id ? "Cancelando..." : "Cancelar"}
              </Botao>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  );
}
