import type { Metadata } from "next";
import type { ReactNode } from "react";
import { obterSessaoAtual } from "@/lib/autenticacao/sessao";
import { CabecalhoAplicacao } from "@/componentes/layouts/CabecalhoAplicacao";
import "./globals.css";

export const metadata: Metadata = {
  title: "BarberGo",
  description: "Marketplace acadêmico de agendamento para barbearias."
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  const sessao = obterSessaoAtual();

  return (
    <html lang="pt-BR">
      <body>
        <CabecalhoAplicacao sessao={sessao} />
        <main>{children}</main>
      </body>
    </html>
  );
}
