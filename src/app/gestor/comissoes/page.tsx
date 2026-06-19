"use client";

import { useBuscarDados } from "@/hooks/useBuscarDados";
import { EstadoCarregando } from "@/componentes/feedback/EstadoCarregando";
import { EstadoErro } from "@/componentes/feedback/EstadoErro";
import { EstadoVazio } from "@/componentes/feedback/EstadoVazio";
import { formatarMoeda, formatarData } from "@/lib/utilitarios/datas";
import toast, { Toaster } from "react-hot-toast";
import { DollarSign, Award, CheckCircle, Calendar, CheckSquare, Percent } from "lucide-react";

export default function GestorComissoesPage() {
  const { dados: comissoes, carregando, erro, recarregar } = useBuscarDados<any[]>("/api/gestor/comissoes");

  async function handleMarcarComoPaga(id: string) {
    try {
      const response = await fetch(`/api/gestor/comissoes/${id}`, {
        method: "PUT"
      });
      const res = await response.json();
      if (response.ok && res.sucesso) {
        toast.success("Comissão marcada como paga!");
        recarregar();
      } else {
        toast.error(res.mensagem || "Erro ao atualizar status.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Erro na comunicação com o servidor.");
    }
  }

  // Estatísticas
  const comissoesPendentes = comissoes?.filter((c) => c.status === "pendente") ?? [];
  const comissoesPagas = comissoes?.filter((c) => c.status === "paga") ?? [];

  const totalPendente = comissoesPendentes.reduce((acc, c) => acc + c.valor, 0);
  const totalPago = comissoesPagas.reduce((acc, c) => acc + c.valor, 0);

  return (
    <div className="container-pagina py-12 space-y-8">
      <Toaster position="top-center" />

      {/* Header */}
      <div>
        <p className="texto-destaque mb-2">FINANCEIRO</p>
        <h1 className="text-4xl font-serif font-bold text-verde_petroleo">Comissões dos Barbeiros</h1>
        <p className="text-texto_secundario">Controle os repasses de valores de serviços aos prestadores parceiros.</p>
      </div>

      {/* Indicadores */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl">
        <div className="bg-white border border-bege_borda p-6 rounded-2xl flex items-center gap-4 shadow-suave">
          <div className="bg-amber-50 text-amber-600 p-3 rounded-xl border border-amber-100">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-texto_secundario uppercase">Comissões Pendentes</p>
            <p className="font-serif font-black text-2xl text-amber-700">{formatarMoeda(totalPendente)}</p>
            <p className="text-[10px] text-texto_secundario">{comissoesPendentes.length} repasses em aberto</p>
          </div>
        </div>

        <div className="bg-white border border-bege_borda p-6 rounded-2xl flex items-center gap-4 shadow-suave">
          <div className="bg-green-50 text-green-600 p-3 rounded-xl border border-green-100">
            <CheckCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-texto_secundario uppercase">Repasses Concluídos</p>
            <p className="font-serif font-black text-2xl text-green-700">{formatarMoeda(totalPago)}</p>
            <p className="text-[10px] text-texto_secundario">{comissoesPagas.length} repasses pagos</p>
          </div>
        </div>

        <div className="bg-white border border-bege_borda p-6 rounded-2xl flex items-center gap-4 shadow-suave">
          <div className="bg-marfim text-verde_petroleo p-3 rounded-xl border border-bege_borda">
            <Percent className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-texto_secundario uppercase">Taxa Padrão Repasse</p>
            <p className="font-serif font-black text-2xl text-verde_petroleo">40% / 60%</p>
            <p className="text-[10px] text-texto_secundario">Barbeiro / Barbearia</p>
          </div>
        </div>
      </div>

      {/* Tabela de Comissões */}
      {carregando ? (
        <EstadoCarregando texto="Buscando histórico de comissões..." />
      ) : erro ? (
        <EstadoErro mensagem={erro} onTentarNovamente={recarregar} />
      ) : comissoes && comissoes.length > 0 ? (
        <div className="bg-white border border-bege_borda rounded-2xl overflow-hidden shadow-suave">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-marfim border-b border-bege_borda text-xs font-black uppercase text-verde_petroleo">
                  <th className="p-4 pl-6">Barbeiro</th>
                  <th className="p-4">Data Atendimento</th>
                  <th className="p-4">Serviço</th>
                  <th className="p-4 text-right">Valor Total</th>
                  <th className="p-4 text-right">Taxa (%)</th>
                  <th className="p-4 text-right">Valor Repasse</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 pr-6 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-bege_borda/50 text-xs">
                {comissoes.map((c) => (
                  <tr key={c.id} className="hover:bg-off_white/50 transition">
                    <td className="p-4 pl-6 font-bold text-texto_principal flex items-center gap-2">
                      <Award className="h-4 w-4 text-dourado shrink-0" /> {c.prestadorNome}
                    </td>
                    <td className="p-4 text-texto_secundario flex-row items-center gap-1">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {formatarData(c.createdAt)}</span>
                    </td>
                    <td className="p-4 text-texto_principal font-medium">{c.servicoNome}</td>
                    <td className="p-4 text-right text-texto_secundario">{formatarMoeda(c.valorServico)}</td>
                    <td className="p-4 text-right text-texto_secundario font-bold">{c.percentual}%</td>
                    <td className="p-4 text-right font-serif font-black text-verde_petroleo text-sm">{formatarMoeda(c.valor)}</td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[9px] ${
                        c.status === "pendente" ? "bg-amber-100 text-amber-800" : "bg-green-100 text-green-800"
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-center">
                      {c.status === "pendente" ? (
                        <button
                          onClick={() => handleMarcarComoPaga(c.id)}
                          className="bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 py-1.5 px-3 rounded-lg font-bold flex items-center justify-center gap-1 mx-auto transition"
                        >
                          <CheckSquare className="h-3.5 w-3.5" /> Pagar
                        </button>
                      ) : (
                        <span className="text-[10px] text-green-600 font-bold uppercase">Repasse Pago</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EstadoVazio titulo="Nenhuma comissão" descricao="Quando atendimentos de agendamento forem concluídos, as comissões serão listadas aqui." />
      )}
    </div>
  );
}
