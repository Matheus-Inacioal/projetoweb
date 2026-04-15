import Link from "next/link";
import type { BarbeariaResumo } from "@/tipos/dados";

export function CartaoBarbearia({ barbearia }: { barbearia: BarbeariaResumo }) {
  return (
    <article className="cartao flex h-full flex-col justify-between p-6">
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-destaque">Barbearia</p>
        <div>
          <h3 className="text-2xl font-bold text-slate-900">{barbearia.nome}</h3>
          <p className="mt-2 text-sm text-slate-600">{barbearia.descricao}</p>
        </div>
        <div className="space-y-1 text-sm text-slate-600">
          <p>{barbearia.endereco}</p>
          <p>{barbearia.telefone}</p>
          <p>
            {barbearia.quantidadeBarbeiros} barbeiros ativos • {barbearia.quantidadeServicos} servicos
          </p>
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <Link className="botao-primario" href={`/barbearias/${barbearia.id}`}>
          Ver detalhes
        </Link>
        <Link className="botao-secundario" href={`/barbearias/${barbearia.id}/barbeiros`}>
          Escolher barbeiro
        </Link>
      </div>
    </article>
  );
}

