import { exigirSessao } from "@/lib/autenticacao/guardas";
import { PaginaAgendamentoCliente } from "@/componentes/paginas/PaginaAgendamentoCliente";

export default function AgendarPage({
  params,
  searchParams
}: {
  params: { barbeariaId: string };
  searchParams: { barbeiroId?: string };
}) {
  exigirSessao(["CONTRATANTE"]);

  return (
    <PaginaAgendamentoCliente
      barbeariaId={params.barbeariaId}
      barbeiroInicialId={searchParams.barbeiroId}
    />
  );
}

