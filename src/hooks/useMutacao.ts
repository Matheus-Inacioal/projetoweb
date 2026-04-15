"use client";

import { useState } from "react";
import type { RespostaApi } from "@/tipos/dados";

export function useMutacao<TResposta, TEntrada = unknown>(url: string, metodo: "POST" | "PATCH" | "PUT" | "DELETE" = "POST") {
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);

  async function executar(entrada?: TEntrada) {
    setCarregando(true);
    setErro(null);
    setMensagemSucesso(null);

    try {
      const resposta = await fetch(url, {
        method: metodo,
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: entrada ? JSON.stringify(entrada) : undefined
      });

      const conteudo = (await resposta.json()) as RespostaApi<TResposta | null>;

      if (!resposta.ok || !conteudo.sucesso) {
        throw new Error(conteudo.mensagem || "Nao foi possivel concluir a operacao.");
      }

      setMensagemSucesso(conteudo.mensagem);
      return conteudo.dados as TResposta;
    } catch (erroAtual) {
      const mensagem = erroAtual instanceof Error ? erroAtual.message : "Erro ao concluir a operacao.";
      setErro(mensagem);
      throw erroAtual;
    } finally {
      setCarregando(false);
    }
  }

  function limparMensagens() {
    setErro(null);
    setMensagemSucesso(null);
  }

  return {
    executar,
    carregando,
    erro,
    mensagemSucesso,
    limparMensagens
  };
}

