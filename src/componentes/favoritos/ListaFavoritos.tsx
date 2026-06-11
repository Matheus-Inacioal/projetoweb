"use client";

import Link from "next/link";
import { useBuscarDados } from "@/hooks/useBuscarDados";
import { EstadoCarregando } from "@/componentes/feedback/EstadoCarregando";
import { EstadoErro } from "@/componentes/feedback/EstadoErro";
import { EstadoVazio } from "@/componentes/feedback/EstadoVazio";
import { formatarData } from "@/lib/utilitarios/datas";

export function ListaFavoritos() {
  const { dados: favoritos, carregando, erro, recarregar } = useBuscarDados<any[]>("/api/favoritos");

  async function handleRemover(prestadorId: string) {
    if (!confirm("Remover este prestador dos favoritos?")) return;
    try {
      const response = await fetch(`/api/favoritos/${prestadorId}`, {
        method: "DELETE"
      });
      if (response.ok) {
        recarregar();
      }
    } catch (err) {
      console.error(err);
    }
  }

  if (carregando) return <EstadoCarregando texto="Carregando favoritos..." />;
  if (erro) return <EstadoErro mensagem={erro} onTentarNovamente={recarregar} />;

  return (
    <div className="space-y-6">
      {favoritos && favoritos.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {favoritos.map((fav) => (
            <div key={fav.id} className="cartao p-6 bg-white border border-bege_borda hover:shadow-premium transition flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-4 border-b border-bege_borda pb-4">
                  <div className="h-12 w-12 rounded-full overflow-hidden bg-bege_borda">
                    {fav.prestadorFotoUrl ? (
                      <img src={fav.prestadorFotoUrl} alt={fav.prestadorNome} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center font-serif text-xl font-black text-verde_petroleo bg-marfim border border-bege_borda">
                        {fav.prestadorNome.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-texto_principal leading-tight">{fav.prestadorNome}</h3>
                    <p className="text-xs font-semibold text-dourado uppercase tracking-wider mt-0.5">{fav.prestadorEspecialidade || "Geral"}</p>
                  </div>
                </div>

                <div className="py-4">
                  <p className="text-xs text-texto_secundario">Favoritado em: {formatarData(fav.criadoEm)}</p>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-bege_borda">
                <Link
                  href={`/prestadores/${fav.prestadorId}`}
                  className="botao-primario text-xs flex-1 text-center py-2 block"
                >
                  Agendar
                </Link>
                <button
                  onClick={() => handleRemover(fav.prestadorId)}
                  className="botao-secundario text-xs text-red-600 border-red-200 hover:bg-red-50 py-2 px-3 rounded-xl"
                >
                  Remover
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EstadoVazio
          titulo="Nenhum favorito ainda"
          descricao="Navegue pelos prestadores e favorite seus profissionais favoritos para acesso rápido."
        />
      )}
    </div>
  );
}
