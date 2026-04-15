"use client";

import { useState, type FormEvent } from "react";
import type { UsuarioResumo } from "@/tipos/dados";
import { CampoTexto } from "@/componentes/ui/CampoTexto";
import { Botao } from "@/componentes/ui/Botao";
import { MensagemRetorno } from "@/componentes/feedback/MensagemRetorno";
import { useMutacao } from "@/hooks/useMutacao";

export function FormularioPerfilUsuario({
  usuario,
  onSalvo
}: {
  usuario: UsuarioResumo;
  onSalvo?: () => void;
}) {
  const [nome, setNome] = useState(usuario.nome);
  const [email, setEmail] = useState(usuario.email);
  const { executar, carregando, erro, mensagemSucesso } = useMutacao<UsuarioResumo, { nome: string; email: string }>(
    "/api/usuarios/perfil",
    "PATCH"
  );

  async function salvarPerfil(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    await executar({ nome, email });
    onSalvo?.();
  }

  return (
    <form className="cartao space-y-4 p-6" onSubmit={(evento) => void salvarPerfil(evento)}>
      <CampoTexto label="Nome" onChange={(evento) => setNome(evento.target.value)} value={nome} />
      <CampoTexto label="E-mail" onChange={(evento) => setEmail(evento.target.value)} type="email" value={email} />

      {erro ? <MensagemRetorno mensagem={erro} tipo="erro" /> : null}
      {mensagemSucesso ? <MensagemRetorno mensagem={mensagemSucesso} tipo="sucesso" /> : null}

      <Botao disabled={carregando} type="submit">
        {carregando ? "Salvando..." : "Salvar perfil"}
      </Botao>
    </form>
  );
}
