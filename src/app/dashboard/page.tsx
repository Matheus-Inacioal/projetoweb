import { exigirSessao } from "@/lib/autenticacao/guardas";
import { DashboardConsumidor } from "@/componentes/dashboard/DashboardConsumidor";
import { DashboardPrestador } from "@/componentes/dashboard/DashboardPrestador";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const sessao = await exigirSessao();

  if (sessao.tipo === "admin") {
    redirect("/admin");
  }

  return (
    <div>
      {sessao.tipo === "prestador" ? (
        <DashboardPrestador />
      ) : (
        <DashboardConsumidor />
      )}
    </div>
  );
}
