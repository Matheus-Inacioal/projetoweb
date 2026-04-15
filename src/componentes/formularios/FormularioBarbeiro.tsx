"use client";

import { useState, type FormEvent } from "react";
import { AreaTexto } from "@/componentes/ui/AreaTexto";
import { Botao } from "@/componentes/ui/Botao";
import { CampoTexto } from "@/componentes/ui/CampoTexto";
import { MensagemRetorno } from "@/componentes/feedback/MensagemRetorno";
import { useMutacao } from "@/hooks/useMutacao";

export function FormularioBarbeiro({
  barbeariaId,
  onSucesso
}: {
  barbeariaId: string;
  onSucesso?: () => void;
}) {
  const [nome, setNome] = useState("");
  const [especialidade, setEspecialidade] = useState("");
  const [descricao, setDescricao] = useState("");
  const [telefone, setTelefone] = useState("");
  const { executar, carregando, erro, mensagemSucesso } = useMutacao(`/api/barbearias/${barbeariaId}/barbeiros`);

  async function cadastrarBarbeiro(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    await executar({
      nome,
      especialidade,
      descricao,
      telefone
    });
    setNome("");
    setEspecialidade("");
    setDescricao("");
    setTelefone("");
    onSucesso?.();
  }

  return (
    <form className="cartao space-y-4 p-6" onSubmit={(evento) => void cadastrarBarbeiro(evento)}>
      <h3 className="text-lg font-semibold text-slate-900">Cadastrar barbeiro</h3>
      <CampoTexto label="Nome" onChange={(evento) => setNome(evento.target.value)} value={nome} />
      <CampoTexto label="Especialidade" onChange={(evento) => setEspecialidade(evento.target.value)} value={especialidade} />
      <CampoTexto label="Telefone" onChange={(evento) => setTelefone(evento.target.value)} value={telefone} />
      <AreaTexto label="Descricao" onChange={(evento) => setDescricao(evento.target.value)} value={descricao} />

      {erro ? <MensagemRetorno mensagem={erro} tipo="erro" /> : null}
      {mensagemSucesso ? <MensagemRetorno mensagem={mensagemSucesso} tipo="sucesso" /> : null}

      <Botao disabled={carregando} type="submit">
        {carregando ? "Salvando..." : "Cadastrar barbeiro"}
      </Botao>
    </form>
  );
}
