"use client";

import { useState } from "react";
import Link from "next/link";
import { useBuscarDados } from "@/hooks/useBuscarDados";
import { EstadoCarregando } from "@/componentes/feedback/EstadoCarregando";
import { EstadoErro } from "@/componentes/feedback/EstadoErro";
import { EstadoVazio } from "@/componentes/feedback/EstadoVazio";
import { CampoTexto } from "@/componentes/ui/CampoTexto";
import { Star, MapPin, Scissors, ChevronRight } from "lucide-react";

export default function LojasDirectoryPage() {
  const [cidade, setCidade] = useState("");
  const [termo, setTermo] = useState("");

  const url = `/api/lojas?cidade=${encodeURIComponent(cidade)}&termo=${encodeURIComponent(termo)}`;
  const { dados: lojas, carregando, erro, recarregar } = useBuscarDados<any[]>(url);

  return (
    <div className="container-pagina py-12 space-y-10">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <p className="texto-destaque mb-2">MARKETPLACE</p>
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-verde_petroleo">Nossas Barbearias</h1>
        <p className="text-texto_secundario text-base">
          Selecione seu estabelecimento favorito, confira a equipe de barbeiros e agende seus serviços.
        </p>
      </div>

      {/* Filtros de Busca Premium */}
      <div className="grid gap-6 md:grid-cols-2 bg-gradient-to-br from-off_white to-marfim p-8 rounded-3xl border border-bege_borda shadow-suave">
        <CampoTexto
          label="Filtrar por Cidade"
          id="filtro-cidade"
          placeholder="Ex: Fortaleza, São Paulo..."
          value={cidade}
          onChange={(e) => setCidade(e.target.value)}
        />
        <CampoTexto
          label="Buscar por Nome ou Descrição"
          id="filtro-termo"
          placeholder="Ex: premium, clássica, navalha..."
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
        />
      </div>

      {/* Grid de Estabelecimentos */}
      {carregando ? (
        <EstadoCarregando texto="Carregando estabelecimentos parceiros..." />
      ) : erro ? (
        <EstadoErro mensagem={erro} onTentarNovamente={recarregar} />
      ) : lojas && lojas.length > 0 ? (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {lojas.map((l) => (
            <div
              key={l.id}
              className="cartao group relative overflow-hidden bg-white border border-bege_borda hover:border-dourado hover:shadow-premium transition-all duration-300 flex flex-col justify-between"
            >
              {/* Capa decorativa ou foto da barbearia */}
              <div className="h-32 w-full bg-gradient-to-r from-verde_petroleo to-verde_escuro relative overflow-hidden">
                {l.capaUrl ? (
                  <img src={l.capaUrl} alt={l.nome} className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition duration-500" />
                ) : (
                  <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#c5a880_1px,transparent_1px)] [background-size:16px_16px]"></div>
                )}
                {/* Logo da loja sobreposto */}
                <div className="absolute -bottom-6 left-6 h-16 w-16 rounded-2xl overflow-hidden bg-white border-2 border-white shadow-suave">
                  {l.logoUrl ? (
                    <img src={l.logoUrl} alt={l.nome} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center font-bold text-verde_petroleo text-xl bg-marfim">
                      {l.nome.charAt(0)}
                    </div>
                  )}
                </div>
              </div>

              {/* Informações da Loja */}
              <div className="pt-10 px-6 pb-6 space-y-4 flex-grow">
                <div className="space-y-1">
                  <h3 className="font-serif font-bold text-xl text-texto_principal group-hover:text-verde_petroleo transition">
                    {l.nome}
                  </h3>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="flex items-center gap-1 text-dourado font-bold">
                      <Star className="h-3.5 w-3.5 fill-current" /> {l.avaliacaoMedia || "5.0"}
                    </span>
                    <span className="flex items-center gap-1 text-texto_secundario">
                      <MapPin className="h-3.5 w-3.5" /> {l.cidade || "Ceará"}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-texto_secundario line-clamp-2 leading-relaxed">
                  {l.descricao || "Uma experiência premium de estética e corte masculino."}
                </p>

                <div className="flex items-center gap-2 pt-2 text-xs font-semibold text-verde_petroleo">
                  <Scissors className="h-3.5 w-3.5" /> {l.quantidadeServicos} serviços catalogados
                </div>
              </div>

              {/* Botão de Ação */}
              <div className="px-6 pb-6">
                <Link
                  href={`/lojas/${l.id}`}
                  className="botao-primario w-full text-center flex items-center justify-center gap-2"
                >
                  Conhecer Barbearia <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EstadoVazio
          titulo="Nenhum estabelecimento encontrado"
          descricao="Tente reajustar os termos ou a cidade selecionada para encontrar novas opções."
        />
      )}
    </div>
  );
}
