import { formatarMoeda } from "@/lib/utilitarios/datas";
import type { ServicoResumo } from "@/tipos/dados";

export function ListaServicos({ servicos }: { servicos: ServicoResumo[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {servicos.map((servico) => (
        <div className="cartao p-5" key={servico.id}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">{servico.nome}</h3>
              <p className="mt-2 text-sm text-slate-600">{servico.descricao}</p>
            </div>
            <span className="rounded-full bg-primaria/10 px-3 py-1 text-xs font-semibold text-primaria">
              {servico.duracaoMinutos} min
            </span>
          </div>
          <p className="mt-4 text-lg font-bold text-destaque">{formatarMoeda(servico.preco)}</p>
        </div>
      ))}
    </div>
  );
}

