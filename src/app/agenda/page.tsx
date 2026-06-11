import { exigirSessao } from "@/lib/autenticacao/guardas";
import { FormularioAgendaServicos } from "@/componentes/formularios/FormularioAgendaServicos";

export const dynamic = "force-dynamic";

export default async function AgendaPage() {
  // Apenas prestadores podem acessar /agenda (também validado no middleware)
  await exigirSessao(["prestador"]);

  return (
    <div className="container-pagina py-12 space-y-8">
      <div>
        <p className="texto-destaque mb-2">GERENCIAMENTO</p>
        <h1 className="text-4xl font-serif font-bold text-verde_petroleo">Agenda & Serviços</h1>
        <p className="text-texto_secundario">Configure seus horários livres e ajuste seu menu de atendimento.</p>
      </div>

      <FormularioAgendaServicos />
    </div>
  );
}
