"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { CampoSelecao } from "@/componentes/ui/CampoSelecao";
import { CampoTexto } from "@/componentes/ui/CampoTexto";
import { Botao } from "@/componentes/ui/Botao";
import { MensagemRetorno } from "@/componentes/feedback/MensagemRetorno";
import { useMutacao } from "@/hooks/useMutacao";
import { PERFIS_CADASTRAVEIS, rotulosPerfil, type PerfilCadastro } from "@/tipos/enums";
import type { SessaoUsuario, UsuarioResumo } from "@/tipos/dados";

interface RespostaCadastro {
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

  return "/";
}

export function FormularioCadastro() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [perfil, setPerfil] = useState<PerfilCadastro>("CONTRATANTE");
  const { executar, carregando, erro } = useMutacao<
    RespostaCadastro,
    { nome: string; email: string; senha: string; perfil: PerfilCadastro }
  >("/api/autenticacao/cadastro");

  async function cadastrar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const resposta = await executar({ nome, email, senha, perfil });
    router.push(obterRotaRedirecionamento(resposta.sessao.perfil));
    router.refresh();
  }

  return (
    <form className="cartao space-y-4 p-6" onSubmit={(evento) => void cadastrar(evento)}>
      <CampoTexto label="Nome completo" onChange={(evento) => setNome(evento.target.value)} value={nome} />
      <CampoTexto label="E-mail" onChange={(evento) => setEmail(evento.target.value)} type="email" value={email} />
      <CampoTexto label="Senha" onChange={(evento) => setSenha(evento.target.value)} type="password" value={senha} />
      <CampoSelecao
        label="Perfil"
        onChange={(evento) => setPerfil(evento.target.value as PerfilCadastro)}
        opcoes={PERFIS_CADASTRAVEIS.map((perfilAtual) => ({
          valor: perfilAtual,
          label: rotulosPerfil[perfilAtual]
        }))}
        value={perfil}
      />

      {erro ? <MensagemRetorno mensagem={erro} tipo="erro" /> : null}

      <Botao disabled={carregando} larguraTotal type="submit">
        {carregando ? "Criando conta..." : "Criar conta"}
      </Botao>
    </form>
  );
}
