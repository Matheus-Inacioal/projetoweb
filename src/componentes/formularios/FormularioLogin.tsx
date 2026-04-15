"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { CampoTexto } from "@/componentes/ui/CampoTexto";
import { Botao } from "@/componentes/ui/Botao";
import { MensagemRetorno } from "@/componentes/feedback/MensagemRetorno";
import { useMutacao } from "@/hooks/useMutacao";
import type { SessaoUsuario, UsuarioResumo } from "@/tipos/dados";

interface RespostaLogin {
  usuario: UsuarioResumo;
  sessao: SessaoUsuario;
}

function obterRotaRedirecionamento(perfil: SessaoUsuario["perfil"]) {
  if (perfil === "PRESTADOR_PF") {
    return "/profissional/dashboard";
  }

  if (perfil === "PRESTADOR_PJ") {
    return "/barbearia/dashboard";
  }

  if (perfil === "ADMIN") {
    return "/admin";
  }

  return "/";
}

export function FormularioLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const { executar, carregando, erro } = useMutacao<RespostaLogin, { email: string; senha: string }>(
    "/api/autenticacao/login"
  );

  async function fazerLogin(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const resposta = await executar({ email, senha });
    router.push(obterRotaRedirecionamento(resposta.sessao.perfil));
    router.refresh();
  }

  return (
    <form className="cartao space-y-4 p-6" onSubmit={(evento) => void fazerLogin(evento)}>
      <CampoTexto
        autoComplete="email"
        label="E-mail"
        onChange={(evento) => setEmail(evento.target.value)}
        placeholder="voce@barbergo.com"
        type="email"
        value={email}
      />
      <CampoTexto
        autoComplete="current-password"
        label="Senha"
        onChange={(evento) => setSenha(evento.target.value)}
        placeholder="Digite sua senha"
        type="password"
        value={senha}
      />

      {erro ? <MensagemRetorno mensagem={erro} tipo="erro" /> : null}

      <Botao disabled={carregando} larguraTotal type="submit">
        {carregando ? "Entrando..." : "Entrar na plataforma"}
      </Botao>
    </form>
  );
}
