"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutacao } from "@/hooks/useMutacao";
import { CampoTexto } from "@/componentes/ui/CampoTexto";
import { Botao } from "@/componentes/ui/Botao";
import { MensagemRetorno } from "@/componentes/feedback/MensagemRetorno";

export function FormularioLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const { executar, carregando, erro } = useMutacao<any, any>("/api/autenticacao/login", "POST");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !senha) return;

    try {
      await executar({ email, senha });
      router.push("/dashboard");
      router.refresh();
    } catch {
      // erro é tratado automaticamente pelo hook
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {erro && <MensagemRetorno tipo="erro" mensagem={erro} />}

      <CampoTexto
        label="E-mail"
        id="email"
        type="email"
        placeholder="seu-email@barbergo.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <CampoTexto
        label="Senha"
        id="senha"
        type="password"
        placeholder="••••••••"
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
        required
      />

      <Botao type="submit" larguraTotal disabled={carregando}>
        {carregando ? "Entrando..." : "Acessar conta"}
      </Botao>
    </form>
  );
}
