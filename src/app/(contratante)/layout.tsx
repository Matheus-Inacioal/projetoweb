import type { ReactNode } from "react";
import { exigirSessao } from "@/lib/autenticacao/guardas";
import { LayoutPainel } from "@/componentes/layouts/LayoutPainel";

export default function LayoutContratante({ children }: { children: ReactNode }) {
  exigirSessao(["CONTRATANTE"]);

  return (
    <LayoutPainel
      descricao="Acompanhe seus agendamentos, atualize seu perfil e centralize sua jornada como cliente."
      itensMenu={[
        { href: "/", label: "Pagina inicial" },
        { href: "/meus-agendamentos", label: "Meus agendamentos" },
        { href: "/perfil", label: "Perfil" }
      ]}
      titulo="Area do contratante"
    >
      {children}
    </LayoutPainel>
  );
}
