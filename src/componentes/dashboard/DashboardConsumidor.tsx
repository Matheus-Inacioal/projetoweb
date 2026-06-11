"use client";

import { useState } from "react";
import Link from "next/link";
import { useBuscarDados } from "@/hooks/useBuscarDados";
import type { PrestadorResumo } from "@/tipos/dados";
import { EstadoCarregando } from "@/componentes/feedback/EstadoCarregando";
import { EstadoErro } from "@/componentes/feedback/EstadoErro";
import { EstadoVazio } from "@/componentes/feedback/EstadoVazio";
import { CampoTexto } from "@/componentes/ui/CampoTexto";

export function DashboardConsumidor() {
  const [cidade, setCidade] = useState("");
  const [termo, setTermo] = useState("");

  const url = `/api/prestadores?cidade=${encodeURIComponent(cidade)}&termo=${encodeURIComponent(termo)}`;
  const { dados: prestadores, carregando, erro, recarregar } = useBuscarDados<PrestadorResumo[]>(url);

  return (
    <div className="container-pagina py-8 space-y-8">
      <div>
        <p className="texto-destaque mb-2">CONSUMIDOR</p>
        <h1 className="text-4xl font-serif font-bold text-verde_petroleo">Encontre Prestadores</h1>
        <p className="text-texto_secundario">Busque profissionais qualificados e agende o seu atendimento.</p>
      </div>

      {/* Filtros */}
      <div className="grid gap-4 md:grid-cols-2 bg-marfim p-6 rounded-2xl border border-bege_borda">
        <CampoTexto
          label="Filtrar por Cidade"
          id="filtro-cidade"
          placeholder="Ex: Fortaleza"
          value={cidade}
          onChange={(e) => setCidade(e.target.value)}
        />
        <CampoTexto
          label="Buscar por Nome ou Especialidade"
          id="filtro-termo"
          placeholder="Ex: degradê, corte, João..."
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
        />
      </div>

      {/* Resultados */}
      {carregando ? (
        <EstadoCarregando texto="Buscando prestadores..." />
      ) : erro ? (
        <EstadoErro mensagem={erro} onTentarNovamente={recarregar} />
      ) : prestadores && prestadores.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {prestadores.map((p) => (
            <div key={p.id} className="cartao overflow-hidden hover:shadow-premium transition flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-4 p-6 border-b border-bege_borda bg-gradient-to-r from-off_white to-marfim">
                  <div className="h-16 w-16 rounded-full overflow-hidden bg-bege_borda flex-shrink-0">
                    {p.fotoUrl ? (
                      <img src={p.fotoUrl} alt={p.nome} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center font-bold text-verde_petroleo text-xl bg-marfim border border-bege_borda">
                        {p.nome.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-lg text-texto_principal">{p.nome}</h3>
                    <p className="text-xs font-semibold text-dourado uppercase tracking-wider">{p.especialidade || "Geral"}</p>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <p className="text-sm text-texto_secundario line-clamp-3">
                    {p.descricao || "Nenhuma descrição fornecida pelo profissional."}
                  </p>

                  <div className="text-xs text-texto_secundario space-y-1">
                    <p>📍 {p.endereco || "Sem endereço cadastrado"}</p>
                    <p>🏙️ {p.cidade || "Cidade não informada"}</p>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-off_white border-t border-bege_borda">
                <Link
                  href={`/prestadores/${p.id}`}
                  className="botao-primario w-full text-center block"
                >
                  Ver Perfil e Agendar
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EstadoVazio
          titulo="Nenhum prestador encontrado"
          descricao="Tente ajustar os filtros de busca para encontrar outros profissionais."
        />
      )}
    </div>
  );
}
