"use client";

import { useState, type FormEvent } from "react";
import { AreaTexto } from "@/componentes/ui/AreaTexto";
import { Botao } from "@/componentes/ui/Botao";
import { CampoTexto } from "@/componentes/ui/CampoTexto";
import { MensagemRetorno } from "@/componentes/feedback/MensagemRetorno";
import { useMutacao } from "@/hooks/useMutacao";

export function FormularioServico({
  barbeariaId,
  onSucesso
}: {
  barbeariaId: string;
  onSucesso?: () => void;
}) {
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [preco, setPreco] = useState("");
  const [duracaoMinutos, setDuracaoMinutos] = useState("30");
  const { executar, carregando, erro, mensagemSucesso } = useMutacao(`/api/barbearias/${barbeariaId}/servicos`);

  async function cadastrarServico(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    await executar({
      nome,
      descricao,
      preco: Number(preco),
      duracaoMinutos: Number(duracaoMinutos)
    });
    setNome("");
    setDescricao("");
    setPreco("");
    setDuracaoMinutos("30");
    onSucesso?.();
  }

  return (
    <form className="cartao space-y-4 p-6" onSubmit={(evento) => void cadastrarServico(evento)}>
      <h3 className="text-lg font-semibold text-slate-900">Cadastrar servico</h3>
      <CampoTexto label="Nome do servico" onChange={(evento) => setNome(evento.target.value)} value={nome} />
      <AreaTexto label="Descricao" onChange={(evento) => setDescricao(evento.target.value)} value={descricao} />
      <div className="grid gap-4 md:grid-cols-2">
        <CampoTexto label="Preco" min="0" onChange={(evento) => setPreco(evento.target.value)} step="0.01" type="number" value={preco} />
        <CampoTexto
          label="Duracao em minutos"
          min="10"
          onChange={(evento) => setDuracaoMinutos(evento.target.value)}
          step="5"
          type="number"
          value={duracaoMinutos}
        />
      </div>

      {erro ? <MensagemRetorno mensagem={erro} tipo="erro" /> : null}
      {mensagemSucesso ? <MensagemRetorno mensagem={mensagemSucesso} tipo="sucesso" /> : null}

      <Botao disabled={carregando} type="submit">
        {carregando ? "Salvando..." : "Cadastrar servico"}
      </Botao>
    </form>
  );
}
