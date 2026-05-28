import Link from "next/link";
import type { BarbeariaResumo } from "@/tipos/dados";

interface CartaoBarbeariaProps {
  barbearia: BarbeariaResumo;
  premium?: boolean;
}

export function CartaoBarbearia({ barbearia, premium = false }: CartaoBarbeariaProps) {
  // Renderizar estrelas de avaliação
  const renderizarEstrelas = (nota: number) => {
    return (
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, i) => (
          <span
            key={i}
            className={i < Math.floor(nota) ? "text-dourado text-lg" : "text-bege_borda text-lg"}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <article className="group relative cartao overflow-hidden flex flex-col h-full transition-all duration-300 hover:shadow-premium">
      {/* Badge Premium */}
      {premium && (
        <div className="absolute top-0 right-0 bg-gradient-to-bl from-dourado to-dourado/80 text-verde_petroleo px-4 py-2 rounded-bl-2xl font-serif font-bold text-sm z-10">
          ★ Premium
        </div>
      )}

      {/* Cabeçalho com fundo colorido */}
      <div className={`px-6 pt-6 pb-4 ${premium ? "bg-gradient-to-br from-verde_petroleo/5 to-dourado/5" : "bg-off_white"}`}>
        {/* Avaliação */}
        <div className="flex items-center justify-between mb-4">
          <div>{renderizarEstrelas(barbearia.avaliacaoMedia)}</div>
          <span className="text-sm font-semibold text-texto_secundario">
            {barbearia.avaliacaoMedia.toFixed(1)}
          </span>
        </div>

        {/* Nome da Barbearia */}
        <h3 className="font-serif text-xl font-bold text-verde_petroleo mb-2">
          {barbearia.nome}
        </h3>

        {/* Descrição */}
        <p className="text-sm text-texto_secundario line-clamp-2">
          {barbearia.descricao}
        </p>
      </div>

      {/* Informações principais */}
      <div className="flex-1 px-6 py-4 space-y-3 border-t border-bege_borda">
        {/* Localização */}
        <div>
          <p className="font-semibold text-verde_escuro text-sm">📍 {barbearia.bairro}</p>
          <p className="text-xs text-texto_secundario">{barbearia.cidade}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="bg-marfim rounded-lg p-2 text-center">
            <p className="font-bold text-verde_petroleo text-lg">
              {barbearia.quantidadeBarbeiros}
            </p>
            <p className="text-xs text-texto_secundario">
              Barbeiro{barbearia.quantidadeBarbeiros !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="bg-marfim rounded-lg p-2 text-center">
            <p className="font-bold text-verde_petroleo text-lg">
              {barbearia.quantidadeServicos}
            </p>
            <p className="text-xs text-texto_secundario">
              Serviço{barbearia.quantidadeServicos !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Telefone */}
        <p className="text-sm text-texto_secundario pt-1">☎️ {barbearia.telefone}</p>
      </div>

      {/* Botões de ação */}
      <div className="flex gap-2 border-t border-bege_borda bg-marfim/50 p-4">
        <Link
          href={`/barbearias/${barbearia.id}`}
          className="flex-1 botao-primario text-center text-sm"
        >
          Ver detalhes
        </Link>
        <Link
          href={`/barbearias/${barbearia.id}/barbeiros`}
          className="flex-1 botao-secundario text-center text-sm"
        >
          Agendar
        </Link>
      </div>
    </article>
  );
}

