"use client";

import { useEffect, useState } from "react";
import type { RespostaApi } from "@/tipos/dados";

interface OpcoesBusca {
  carregarAoMontar?: boolean;
}

async function buscarConteudo<TDados>(url: string) {
  const resposta = await fetch(url, {
    credentials: "include",
    cache: "no-store"
  });

  const conteudo = (await resposta.json()) as RespostaApi<TDados | null>;

  if (!resposta.ok || !conteudo.sucesso) {
    throw new Error(conteudo.mensagem || "Nao foi possivel carregar os dados.");
  }

  return (conteudo.dados ?? null) as TDados | null;
}

export function useBuscarDados<TDados>(url: string | null, opcoes?: OpcoesBusca) {
  const [dados, setDados] = useState<TDados | null>(null);
  const [carregando, setCarregando] = useState(Boolean(url && opcoes?.carregarAoMontar !== false));
  const [erro, setErro] = useState<string | null>(null);

  async function recarregar() {
    if (!url) {
      setCarregando(false);
      return;
    }

    setCarregando(true);
    setErro(null);

    try {
      const conteudo = await buscarConteudo<TDados>(url);
      setDados(conteudo);
    } catch (erroAtual) {
      setErro(erroAtual instanceof Error ? erroAtual.message : "Erro ao carregar dados.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    if (opcoes?.carregarAoMontar === false) {
      setCarregando(false);
      return;
    }

    let ativo = true;

    async function carregarAoMontar() {
      if (!url) {
        setCarregando(false);
        return;
      }

      setCarregando(true);
      setErro(null);

      try {
        const conteudo = await buscarConteudo<TDados>(url);

        if (ativo) {
          setDados(conteudo);
        }
      } catch (erroAtual) {
        if (ativo) {
          setErro(erroAtual instanceof Error ? erroAtual.message : "Erro ao carregar dados.");
        }
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    }

    void carregarAoMontar();

    return () => {
      ativo = false;
    };
  }, [url, opcoes?.carregarAoMontar]);

  return {
    dados,
    carregando,
    erro,
    recarregar,
    definirDados: setDados
  };
}
