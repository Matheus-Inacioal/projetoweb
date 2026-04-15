import type { ReactNode } from "react";

interface ColunaTabela<TLinha> {
  chave: string;
  titulo: string;
  renderizar: (linha: TLinha) => ReactNode;
}

export function TabelaDados<TLinha>({
  colunas,
  linhas
}: {
  colunas: ColunaTabela<TLinha>[];
  linhas: TLinha[];
}) {
  return (
    <div className="cartao overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              {colunas.map((coluna) => (
                <th key={coluna.chave} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  {coluna.titulo}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {linhas.map((linha, indice) => (
              <tr key={indice}>
                {colunas.map((coluna) => (
                  <td key={coluna.chave} className="px-4 py-4 align-top text-sm text-slate-700">
                    {coluna.renderizar(linha)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
