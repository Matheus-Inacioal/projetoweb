"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutacao } from "@/hooks/useMutacao";
import { CampoTexto } from "@/componentes/ui/CampoTexto";
import { CampoSelecao } from "@/componentes/ui/CampoSelecao";
import { Botao } from "@/componentes/ui/Botao";
import { MensagemRetorno } from "@/componentes/feedback/MensagemRetorno";

export function FormularioCadastro() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [senha, setSenha] = useState("");
  const [tipo, setTipo] = useState("consumidor");

  const { executar, carregando, erro } = useMutacao<any, any>("/api/autenticacao/cadastro", "POST");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nome || !email || !senha) return;

    try {
      await executar({
        nome,
        email,
        telefone,
        senha,
        tipo
      });
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
        label="Nome completo"
        id="nome"
        type="text"
        placeholder="Seu nome"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        required
      />

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
        label="Telefone"
        id="telefone"
        type="tel"
        placeholder="(99) 99999-9999"
        value={telefone}
        onChange={(e) => setTelefone(e.target.value)}
      />

      <CampoTexto
        label="Senha"
        id="senha"
        type="password"
        placeholder="Mínimo 6 caracteres"
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
        required
      />

      <CampoSelecao
        label="Tipo de Conta"
        id="tipo"
        value={tipo}
        onChange={(e) => setTipo(e.target.value)}
        opcoes={[
          { valor: "consumidor", label: "Consumidor (Cliente)" },
          { valor: "prestador", label: "Prestador (Barbeiro)" }
        ]}
      />

      <Botao type="submit" larguraTotal disabled={carregando}>
        {carregando ? "Criando conta..." : "Criar conta"}
      </Botao>
    </form>
  );
}
