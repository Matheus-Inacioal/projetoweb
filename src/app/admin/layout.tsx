import type { ReactNode } from "react";
import { exigirSessao } from "@/lib/autenticacao/guardas";
import { LayoutPainel } from "@/componentes/layouts/LayoutPainel";

export default function LayoutAdmin({ children }: { children: ReactNode }) {
  exigirSessao(["ADMIN"]);

  return (
    <LayoutPainel
      descricao="Visualize usuarios, barbearias e agendamentos para acompanhar o funcionamento do BarberGo."
      itensMenu={[
        { href: "/admin", label: "Dashboard" },
        { href: "/admin/usuarios", label: "Usuarios" },
        { href: "/admin/barbearias", label: "Barbearias" },
        { href: "/admin/agendamentos", label: "Agendamentos" }
      ]}
      titulo="Painel administrativo"
    >
      {children}
    </LayoutPainel>
  );
}
