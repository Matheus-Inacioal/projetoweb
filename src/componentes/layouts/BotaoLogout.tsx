"use client";

import { useRouter } from "next/navigation";
import { useMutacao } from "@/hooks/useMutacao";
import { Botao } from "@/componentes/ui/Botao";

export function BotaoLogout() {
  const router = useRouter();
  const { executar, carregando } = useMutacao<null>("/api/autenticacao/logout");

  async function sair() {
    await executar();
    router.push("/");
    router.refresh();
  }

  return (
    <Botao onClick={() => void sair()} type="button" variante="secundario">
      {carregando ? "Saindo..." : "Sair"}
    </Botao>
  );
}

