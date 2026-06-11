import { exigirSessao } from "@/lib/autenticacao/guardas";
import { DetalhesPrestador } from "@/componentes/prestadores/DetalhesPrestador";

export const dynamic = "force-dynamic";

export default async function PrestadorDetalhesPage({ params }: { params: { id: string } }) {
  await exigirSessao();

  return <DetalhesPrestador prestadorId={params.id} />;
}
