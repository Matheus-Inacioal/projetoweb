"use client";

import { useState, type FormEvent } from "react";
import type { BarbeiroResumo } from "@/tipos/dados";
import { AreaTexto } from "@/componentes/ui/AreaTexto";
import { Botao } from "@/componentes/ui/Botao";
import { CampoTexto } from "@/componentes/ui/CampoTexto";
import { MensagemRetorno } from "@/componentes/feedback/MensagemRetorno";
import { useMutacao } from "@/hooks/useMutacao";

export function FormularioPerfilProfissional({
  barbeiro,
  onSalvo
}: {
  barbeiro: BarbeiroResumo | null;
  onSalvo?: () => void;
}) {
  const [nome, setNome] = useState(barbeiro?.nome || "");
  const [especialidade, setEspecialidade] = useState(barbeiro?.especialidade || "");
  const [descricao, setDescricao] = useState(barbeiro?.descricao || "");
  const [telefone, setTelefone] = useState(barbeiro?.telefone || "");
  const { executar, carregando, erro, mensagemSucesso } = useMutacao(
    "/api/profissional/perfil"
  );

  async function salvarPerfil(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    await executar({
      nome,
      especialidade,
      descricao,
      telefone
    });
    onSalvo?.();
  }

  return (
    <form className="cartao space-y-4 p-6" onSubmit={(evento) => void salvarPerfil(evento)}>
      <CampoTexto label="Nome profissional" onChange={(evento) => setNome(evento.target.value)} value={nome} />
      <CampoTexto label="Especialidade" onChange={(evento) => setEspecialidade(evento.target.value)} value={especialidade} />
      <CampoTexto label="Telefone" onChange={(evento) => setTelefone(evento.target.value)} value={telefone} />
      <AreaTexto label="Descricao profissional" onChange={(evento) => setDescricao(evento.target.value)} value={descricao} />

      {erro ? <MensagemRetorno mensagem={erro} tipo="erro" /> : null}
      {mensagemSucesso ? <MensagemRetorno mensagem={mensagemSucesso} tipo="sucesso" /> : null}

      <Botao disabled={carregando} type="submit">
        {carregando ? "Salvando..." : "Salvar perfil profissional"}
      </Botao>
    </form>
  );
}
