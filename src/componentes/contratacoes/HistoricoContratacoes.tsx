"use client";

import { useBuscarDados } from "@/hooks/useBuscarDados";
import { EstadoCarregando } from "@/componentes/feedback/EstadoCarregando";
import { EstadoErro } from "@/componentes/feedback/EstadoErro";
import { EstadoVazio } from "@/componentes/feedback/EstadoVazio";
import { formatarMoeda, formatarData } from "@/lib/utilitarios/datas";

export function HistoricoContratacoes() {
  const { dados: contratacoes, carregando, erro, recarregar } = useBuscarDados<any[]>("/api/contratacoes");

  async function handleCancelar(id: string) {
    if (!confirm("Deseja realmente cancelar este agendamento?")) return;
    try {
      const response = await fetch(`/api/contratacoes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELADO" })
      });
      if (response.ok) {
        recarregar();
      }
    } catch (err) {
      console.error(err);
    }
  }

  if (carregando) return <EstadoCarregando texto="Carregando contratações..." />;
  if (erro) return <EstadoErro mensagem={erro} onTentarNovamente={recarregar} />;

  return (
    <div className="space-y-6">
      {contratacoes && contratacoes.length > 0 ? (
        <div className="space-y-4">
          {contratacoes.map((c) => (
            <div key={c.id} className="cartao p-6 bg-white border border-bege_borda flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h3 className="font-serif font-bold text-lg text-texto_principal">{c.prestadorNome}</h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    c.status === "PENDENTE" && "bg-yellow-100 text-yellow-800"
                  } ${
                    c.status === "CONFIRMADO" && "bg-blue-100 text-blue-800"
                  } ${
                    c.status === "CONCLUIDO" && "bg-green-100 text-green-800"
                  } ${
                    c.status === "CANCELADO" && "bg-red-100 text-red-800"
                  }`}>
                    {c.status}
                  </span>
                </div>
                <p className="text-sm font-semibold text-dourado uppercase tracking-wider">{c.prestadorEspecialidade || "Geral"}</p>
                <p className="text-sm text-texto_secundario">
                  ✂️ <span className="font-medium text-texto_principal">{c.servicoNome}</span> • 💰 {formatarMoeda(c.valor)}
                </p>
                <p className="text-xs text-texto_secundario">
                  📅 Data: {formatarData(c.data)} às {c.horario}
                </p>
                {c.observacao && (
                  <p className="text-xs italic bg-marfim p-2 rounded text-texto_secundario">
                    💬 Obs: {c.observacao}
                  </p>
                )}
              </div>

              {(c.status === "PENDENTE" || c.status === "CONFIRMADO") && (
                <button
                  onClick={() => handleCancelar(c.id)}
                  className="botao-secundario text-xs text-red-600 border-red-200 hover:bg-red-50 py-2 px-4 rounded-xl"
                >
                  Cancelar Agendamento
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <EstadoVazio
          titulo="Nenhuma contratação realizada"
          descricao="Você ainda não agendou nenhum serviço com nossos profissionais."
        />
      )}
    </div>
  );
}
