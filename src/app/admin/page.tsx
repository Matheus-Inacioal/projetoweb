import { exigirSessao } from "@/lib/autenticacao/guardas";
import { PainelAdmin } from "@/componentes/admin/PainelAdmin";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await exigirSessao(["admin"]);

  return (
    <div className="container-pagina py-12 space-y-8">
      <div>
        <p className="texto-destaque mb-2">PAINEL ADMINISTRATIVO</p>
        <h1 className="text-4xl font-serif font-bold text-verde_petroleo">Visão Geral</h1>
        <p className="text-texto_secundario">Monitore os principais indicadores de atividade do BarberGo.</p>
      </div>

      <PainelAdmin />
    </div>
  );
}
