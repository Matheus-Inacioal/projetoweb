import type { ReactNode } from "react";
import { exigirSessao } from "@/lib/autenticacao/guardas";
import { LayoutPainel } from "@/componentes/layouts/LayoutPainel";

export default function LayoutBarbearia({ children }: { children: ReactNode }) {
  exigirSessao(["PRESTADOR_PJ"]);

  return (
    <LayoutPainel
      descricao="Gerencie a operacao da barbearia com uma visao centralizada de agenda, profissionais e servicos."
      itensMenu={[
        { href: "/barbearia/dashboard", label: "Dashboard" },
        { href: "/barbearia/agenda", label: "Agenda geral" },
        { href: "/barbearia/barbeiros", label: "Barbeiros" },
        { href: "/barbearia/servicos", label: "Servicos" },
        { href: "/barbearia/perfil", label: "Perfil da barbearia" }
      ]}
      titulo="Painel da barbearia"
    >
      {children}
    </LayoutPainel>
  );
}
