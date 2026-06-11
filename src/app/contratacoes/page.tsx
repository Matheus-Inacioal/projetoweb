import { exigirSessao } from "@/lib/autenticacao/guardas";
import { HistoricoContratacoes } from "@/componentes/contratacoes/HistoricoContratacoes";

export const dynamic = "force-dynamic";

export default async function ContratacoesPage() {
  await exigirSessao(["consumidor"]);

  return (
    <div className="container-pagina py-12 space-y-8">
      <div>
        <p className="texto-destaque mb-2">HISTÓRICO</p>
        <h1 className="text-4xl font-serif font-bold text-verde_petroleo">Minhas Contratações</h1>
        <p className="text-texto_secundario">Veja o status e histórico de todas as suas solicitações de serviço.</p>
      </div>

      <HistoricoContratacoes />
    </div>
  );
}
