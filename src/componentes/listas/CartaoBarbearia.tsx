import Link from "next/link";
import type { BarbeariaResumo } from "@/tipos/dados";

export function CartaoBarbearia({ barbearia }: { barbearia: BarbeariaResumo }) {
  // Estrelas de avaliação
  const renderizarEstrelas = (nota: number) => {
    const estrelas = [];
    for (let i = 0; i < 5; i++) {
      estrelas.push(
        <span key={i} className={i < Math.floor(nota) ? "text-yellow-400" : "text-gray-300"}>
          ★
        </span>
      );
    }
    return estrelas;
  };

  return (
    <article className="cartao flex h-full flex-col justify-between overflow-hidden transition hover:shadow-lg">
      {/* Header com destaque */}
      {barbearia.destaque && (
        <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 px-4 py-2 text-center text-sm font-bold text-slate-900">
          ⭐ Em destaque
        </div>
      )}

      <div className="space-y-4 p-6">
        {/* Avaliação */}
        <div className="flex items-center justify-between">
          <div className="flex gap-1 text-sm">{renderizarEstrelas(barbearia.avaliacaoMedia)}</div>
          <p className="text-xs font-semibold text-slate-500">{barbearia.avaliacaoMedia.toFixed(1)}</p>
        </div>

        {/* Informações principais */}
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-slate-900">{barbearia.nome}</h3>
          <p className="text-sm text-slate-600">{barbearia.descricao}</p>
        </div>

        {/* Localização */}
        <div className="space-y-1 text-sm text-slate-600">
          <p className="font-semibold text-slate-700">📍 {barbearia.bairro}</p>
          <p className="text-xs">{barbearia.cidade}</p>
        </div>

        {/* Stats */}
        <div className="flex gap-3 border-t border-slate-200 pt-3 text-sm text-slate-600">
          <div className="flex-1">
            <p className="font-semibold text-slate-700">{barbearia.quantidadeBarbeiros}</p>
            <p className="text-xs">Barbeiro{barbearia.quantidadeBarbeiros !== 1 ? "s" : ""}</p>
          </div>
          <div className="flex-1 border-l border-slate-200 pl-3">
            <p className="font-semibold text-slate-700">{barbearia.quantidadeServicos}</p>
            <p className="text-xs">Serviço{barbearia.quantidadeServicos !== 1 ? "s" : ""}</p>
          </div>
        </div>

        {/* Telefone */}
        <p className="text-sm text-slate-500">☎️ {barbearia.telefone}</p>
      </div>

      {/* Botões de ação */}
      <div className="flex gap-3 border-t border-slate-200 bg-slate-50 p-4">
        <Link className="botao-primario flex-1 text-center" href={`/barbearias/${barbearia.id}`}>
          Ver detalhes
        </Link>
        <Link className="botao-secundario flex-1 text-center" href={`/barbearias/${barbearia.id}/barbeiros`}>
          Agendar
        </Link>
      </div>
    </article>
  );
}

