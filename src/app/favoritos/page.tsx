import { exigirSessao } from "@/lib/autenticacao/guardas";
import { ListaFavoritos } from "@/componentes/favoritos/ListaFavoritos";

export const dynamic = "force-dynamic";

export default async function FavoritosPage() {
  await exigirSessao(["consumidor"]);

  return (
    <div className="container-pagina py-12 space-y-8">
      <div>
        <p className="texto-destaque mb-2">SELEÇÃO</p>
        <h1 className="text-4xl font-serif font-bold text-verde_petroleo">Meus Favoritos</h1>
        <p className="text-texto_secundario">Acesse rapidamente e agende com seus profissionais preferidos.</p>
      </div>

      <ListaFavoritos />
    </div>
  );
}
