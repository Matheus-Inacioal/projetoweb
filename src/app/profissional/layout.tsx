import type { ReactNode } from "react";
import { exigirSessao } from "@/lib/autenticacao/guardas";
import { LayoutPainel } from "@/componentes/layouts/LayoutPainel";

export default function LayoutProfissional({ children }: { children: ReactNode }) {
  exigirSessao(["PRESTADOR_PF"]);

  return (
    <LayoutPainel
      descricao="Consulte sua agenda, configure disponibilidade e mantenha seu perfil profissional atualizado."
      itensMenu={[
        { href: "/profissional/dashboard", label: "Dashboard" },
        { href: "/profissional/agenda", label: "Agenda" },
        { href: "/profissional/disponibilidade", label: "Disponibilidade" },
        { href: "/profissional/perfil", label: "Perfil profissional" }
      ]}
      titulo="Painel do barbeiro"
    >
      {children}
    </LayoutPainel>
  );
}
