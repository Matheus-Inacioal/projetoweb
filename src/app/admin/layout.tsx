import { exigirSessao } from "@/lib/autenticacao/guardas";
import { SidebarAdmin } from "@/componentes/admin/SidebarAdmin";
import type { ReactNode } from "react";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children
}: {
  children: ReactNode;
}) {
  // Garantir acesso exclusivo a administradores
  await exigirSessao(["admin"]);

  return (
    <div className="flex min-h-[calc(100vh-80px)] bg-off_white">
      {/* Menu Lateral */}
      <SidebarAdmin />

      {/* Área de Conteúdo Principal */}
      <div className="flex-1 overflow-x-hidden p-6 md:p-10">
        <div className="w-full max-w-7xl mx-auto space-y-8">
          {children}
        </div>
      </div>
    </div>
  );
}
