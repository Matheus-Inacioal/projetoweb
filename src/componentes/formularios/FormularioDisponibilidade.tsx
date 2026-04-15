"use client";

import { useState, type FormEvent } from "react";
import { CampoSelecao } from "@/componentes/ui/CampoSelecao";
import { Botao } from "@/componentes/ui/Botao";
import { CampoTexto } from "@/componentes/ui/CampoTexto";
import { MensagemRetorno } from "@/componentes/feedback/MensagemRetorno";
import { useMutacao } from "@/hooks/useMutacao";
import { DIAS_SEMANA, rotulosDiaSemana, type DiaSemana } from "@/tipos/enums";

export function FormularioDisponibilidade({
  barbeiroId,
  onSucesso
}: {
  barbeiroId: string;
  onSucesso?: () => void;
}) {
  const [diaSemana, setDiaSemana] = useState<DiaSemana>("SEGUNDA");
  const [horaInicio, setHoraInicio] = useState("09:00");
  const [horaFim, setHoraFim] = useState("18:00");
  const { executar, carregando, erro, mensagemSucesso } = useMutacao(`/api/barbeiros/${barbeiroId}/disponibilidades`);

  async function cadastrarDisponibilidade(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    await executar({
      diaSemana,
      horaInicio,
      horaFim
    });
    onSucesso?.();
  }

  return (
    <form className="cartao space-y-4 p-6" onSubmit={(evento) => void cadastrarDisponibilidade(evento)}>
      <h3 className="text-lg font-semibold text-slate-900">Nova disponibilidade</h3>
      <CampoSelecao
        label="Dia da semana"
        onChange={(evento) => setDiaSemana(evento.target.value as DiaSemana)}
        opcoes={DIAS_SEMANA.map((dia) => ({
          valor: dia,
          label: rotulosDiaSemana[dia]
        }))}
        value={diaSemana}
      />
      <div className="grid gap-4 md:grid-cols-2">
        <CampoTexto label="Hora inicial" onChange={(evento) => setHoraInicio(evento.target.value)} type="time" value={horaInicio} />
        <CampoTexto label="Hora final" onChange={(evento) => setHoraFim(evento.target.value)} type="time" value={horaFim} />
      </div>

      {erro ? <MensagemRetorno mensagem={erro} tipo="erro" /> : null}
      {mensagemSucesso ? <MensagemRetorno mensagem={mensagemSucesso} tipo="sucesso" /> : null}

      <Botao disabled={carregando} type="submit">
        {carregando ? "Salvando..." : "Cadastrar disponibilidade"}
      </Botao>
    </form>
  );
}
