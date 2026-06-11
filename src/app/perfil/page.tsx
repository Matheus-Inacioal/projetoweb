import { exigirSessao } from "@/lib/autenticacao/guardas";
import { FormularioPerfil } from "@/componentes/formularios/FormularioPerfil";

export const dynamic = "force-dynamic";

export default async function PerfilPage() {
  await exigirSessao();

  return (
    <div className="container-pagina py-12 max-w-2xl mx-auto space-y-8">
      <div>
        <p className="texto-destaque mb-2">CONFIGURAÇÕES</p>
        <h1 className="text-4xl font-serif font-bold text-verde_petroleo">Editar Perfil</h1>
        <p className="text-texto_secundario">Mantenha seus dados atualizados para contato e agendamentos.</p>
      </div>

      <div className="cartao p-8 bg-white border border-bege_borda">
        <FormularioPerfil />
      </div>
    </div>
  );
}
