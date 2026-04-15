"use client";

import { useState, type FormEvent } from "react";
import type { BarbeariaResumo } from "@/tipos/dados";
import { AreaTexto } from "@/componentes/ui/AreaTexto";
import { Botao } from "@/componentes/ui/Botao";
import { CampoTexto } from "@/componentes/ui/CampoTexto";
import { MensagemRetorno } from "@/componentes/feedback/MensagemRetorno";
import { useMutacao } from "@/hooks/useMutacao";

export function FormularioBarbearia({
  barbearia,
  onSalvo
}: {
  barbearia: BarbeariaResumo | null;
  onSalvo?: () => void;
}) {
  const [nome, setNome] = useState(barbearia?.nome || "");
  const [descricao, setDescricao] = useState(barbearia?.descricao || "");
  const [endereco, setEndereco] = useState(barbearia?.endereco || "");
  const [telefone, setTelefone] = useState(barbearia?.telefone || "");
  const { executar, carregando, erro, mensagemSucesso } = useMutacao("/api/barbearia/perfil");

  async function salvarBarbearia(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    await executar({
      nome,
      descricao,
      endereco,
      telefone
    });
    onSalvo?.();
  }

  return (
    <form className="cartao space-y-4 p-6" onSubmit={(evento) => void salvarBarbearia(evento)}>
      <CampoTexto label="Nome da barbearia" onChange={(evento) => setNome(evento.target.value)} value={nome} />
      <AreaTexto label="Descricao" onChange={(evento) => setDescricao(evento.target.value)} value={descricao} />
      <CampoTexto label="Endereco" onChange={(evento) => setEndereco(evento.target.value)} value={endereco} />
      <CampoTexto label="Telefone" onChange={(evento) => setTelefone(evento.target.value)} value={telefone} />

      {erro ? <MensagemRetorno mensagem={erro} tipo="erro" /> : null}
      {mensagemSucesso ? <MensagemRetorno mensagem={mensagemSucesso} tipo="sucesso" /> : null}

      <Botao disabled={carregando} type="submit">
        {carregando ? "Salvando..." : "Salvar barbearia"}
      </Botao>
    </form>
  );
}
