"use client";

import { useState, useEffect } from "react";
import { useBuscarDados } from "@/hooks/useBuscarDados";
import { EstadoCarregando } from "@/componentes/feedback/EstadoCarregando";
import { EstadoErro } from "@/componentes/feedback/EstadoErro";
import { CartaoMetrica } from "@/componentes/ui/CartaoMetrica";
import { formatarMoeda } from "@/lib/utilitarios/datas";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts";
import { DollarSign, Calendar, ShoppingBag, Users, Award, TrendingUp, Clock, Scissors } from "lucide-react";

const CORES = ["#0F2F2A", "#174C43", "#C89B3C", "#E4D8C8", "#7A1F2B", "#526173", "#82ca9d", "#8884d8"];

export default function GestorDashboardPage() {
  const { dados: resumo, carregando, erro, recarregar } = useBuscarDados<any>("/api/gestor/dashboard");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (carregando) return <EstadoCarregando texto="Carregando indicadores da loja..." />;
  if (erro) return <EstadoErro mensagem={erro} onTentarNovamente={recarregar} />;

  return (
    <div className="container-pagina py-12 space-y-10">
      <div>
        <p className="texto-destaque mb-2">GERENTE</p>
        <h1 className="text-4xl font-serif font-bold text-verde_petroleo">Painel Financeiro & Operacional</h1>
        <p className="text-texto_secundario">Monitore os resultados de faturamento, estoque, equipe e agendamentos.</p>
      </div>

      {/* Indicadores Principais */}
      <div>
        <h2 className="text-xl font-serif font-bold text-verde_escuro mb-4 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-dourado rounded-full block" />
          Métricas de Desempenho
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <CartaoMetrica
            titulo="Faturamento Hoje"
            valor={formatarMoeda(resumo?.faturamentoHoje ?? 0)}
            detalhe="Serviços + produtos vendidos"
          />
          <CartaoMetrica
            titulo="Faturamento Mês"
            valor={formatarMoeda(resumo?.faturamentoMes ?? 0)}
            detalhe="Faturamento total acumulado"
          />
          <CartaoMetrica
            titulo="Faturamento Anual"
            valor={formatarMoeda(resumo?.faturamentoAnual ?? 0)}
            detalhe="Ano corrente"
          />
          <CartaoMetrica
            titulo="Ticket Médio"
            valor={formatarMoeda(resumo?.ticketMedio ?? 0)}
            detalhe="Média por operação"
          />
          <CartaoMetrica
            titulo="Total de Agendamentos"
            valor={`${resumo?.totalAgendamentos ?? 0} atendimentos`}
            detalhe="Contratações de serviços"
          />
          <CartaoMetrica
            titulo="Total de Vendas"
            valor={`${resumo?.totalProdutosVendidos ?? 0} itens`}
            detalhe="Saídas físicas do estoque"
          />
          <CartaoMetrica
            titulo="Clientes Ativos"
            valor={`${resumo?.clientesAtivos ?? 0} consumidores`}
            detalhe="Base ativa no período"
          />
          <CartaoMetrica
            titulo="Novos Clientes"
            valor={`${resumo?.novosClientes ?? 0} cadastros`}
            detalhe="Adquiridos neste mês"
          />
        </div>
      </div>

      {/* Gráficos Recharts */}
      {mounted && (
        <div className="grid gap-8 md:grid-cols-2">
          {/* Receita Mensal */}
          <div className="cartao p-6 space-y-4">
            <div>
              <h3 className="text-lg font-serif font-bold text-verde_petroleo flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-dourado" /> Faturamento por Mês (Últimos 12 meses)
              </h3>
              <p className="text-xs text-texto_secundario">Análise de receitas combinadas</p>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={resumo?.receitaMensal ?? []}>
                  <defs>
                    <linearGradient id="corReceita" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C89B3C" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#C89B3C" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E4D8C8" />
                  <XAxis dataKey="rotulo" stroke="#526173" fontSize={11} />
                  <YAxis stroke="#526173" fontSize={11} />
                  <Tooltip formatter={(v) => `R$ ${Number(v).toFixed(2)}`} contentStyle={{ backgroundColor: "#FFF8EF", borderRadius: 8, borderColor: "#E4D8C8" }} />
                  <Area type="monotone" dataKey="valor" stroke="#C89B3C" fillOpacity={1} fill="url(#corReceita)" name="Receita (R$)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Horários mais Movimentados */}
          <div className="cartao p-6 space-y-4">
            <div>
              <h3 className="text-lg font-serif font-bold text-verde_petroleo flex items-center gap-2">
                <Clock className="h-5 w-5 text-dourado" /> Horários de Pico
              </h3>
              <p className="text-xs text-texto_secundario">Número de agendamentos por faixa de horário</p>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={resumo?.horariosMovimentados ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E4D8C8" />
                  <XAxis dataKey="hora" stroke="#526173" fontSize={11} />
                  <YAxis stroke="#526173" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: "#FFF8EF", borderRadius: 8, borderColor: "#E4D8C8" }} />
                  <Bar dataKey="quantidade" fill="#174C43" radius={[4, 4, 0, 0]} name="Agendamentos" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Serviços mais Vendidos */}
          <div className="cartao p-6 space-y-4">
            <div>
              <h3 className="text-lg font-serif font-bold text-verde_petroleo flex items-center gap-2">
                <Scissors className="h-5 w-5 text-dourado" /> Top 10 Serviços mais Vendidos
              </h3>
              <p className="text-xs text-texto_secundario">Fatias de vendas por serviço no catálogo</p>
            </div>
            <div className="h-72 w-full flex flex-col sm:flex-row items-center justify-between">
              <div className="h-56 w-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={resumo?.servicosMaisVendidos ?? []}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="quantidade"
                    >
                      {(resumo?.servicosMaisVendidos ?? []).map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={CORES[index % CORES.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "#FFF8EF", borderRadius: 8, borderColor: "#E4D8C8" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 px-4 space-y-1.5 self-center">
                {(resumo?.servicosMaisVendidos ?? []).slice(0, 5).map((item: any, index: number) => (
                  <div key={item.nome} className="flex items-center gap-2 text-xs text-texto_principal">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: CORES[index % CORES.length] }} />
                    <span className="truncate max-w-[120px]">{item.nome}</span>
                    <span className="font-bold ml-auto">{item.quantidade}x</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Produtos mais Vendidos */}
          <div className="cartao p-6 space-y-4">
            <div>
              <h3 className="text-lg font-serif font-bold text-verde_petroleo flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-dourado" /> Top 10 Produtos mais Vendidos
              </h3>
              <p className="text-xs text-texto_secundario">Contagem de saídas por produto</p>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={resumo?.produtosMaisVendidos ?? []} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#E4D8C8" />
                  <XAxis type="number" stroke="#526173" fontSize={11} />
                  <YAxis dataKey="nome" type="category" stroke="#526173" fontSize={10} width={90} />
                  <Tooltip contentStyle={{ backgroundColor: "#FFF8EF", borderRadius: 8, borderColor: "#E4D8C8" }} />
                  <Bar dataKey="quantidade" fill="#0F2F2A" radius={[0, 4, 4, 0]} name="Vendas" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Ranking Barbeiros */}
          <div className="cartao p-6 space-y-4">
            <h3 className="text-lg font-serif font-bold text-verde_petroleo flex items-center gap-2">
              <Award className="h-5 w-5 text-dourado" /> Produtividade da Equipe
            </h3>
            <div className="space-y-4 max-h-[300px] overflow-y-auto">
              {(resumo?.prestadoresMaisProdutivos ?? []).map((p: any, idx: number) => (
                <div key={p.nome} className="flex items-center gap-4 bg-white p-3 border border-bege_borda rounded-xl shadow-suave">
                  <div className="h-8 w-8 rounded-full bg-verde_petroleo text-off_white font-serif font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-grow">
                    <p className="font-bold text-sm text-texto_principal">{p.nome}</p>
                    <p className="text-[10px] text-texto_secundario">{p.quantidade} atendimentos concluídos</p>
                  </div>
                  <span className="font-serif font-black text-sm text-verde_escuro">{formatarMoeda(p.faturamento)}</span>
                </div>
              ))}
              {(resumo?.prestadoresMaisProdutivos ?? []).length === 0 && (
                <p className="text-xs text-texto_secundario text-center py-6">Nenhum atendimento registrado no ranking.</p>
              )}
            </div>
          </div>

          {/* Ranking Clientes */}
          <div className="cartao p-6 space-y-4">
            <h3 className="text-lg font-serif font-bold text-verde_petroleo flex items-center gap-2">
              <Users className="h-5 w-5 text-dourado" /> Clientes Mais Fiéis
            </h3>
            <div className="space-y-4 max-h-[300px] overflow-y-auto">
              {(resumo?.clientesMaisCompram ?? []).map((c: any, idx: number) => (
                <div key={c.nome} className="flex items-center gap-4 bg-white p-3 border border-bege_borda rounded-xl shadow-suave">
                  <div className="h-8 w-8 rounded-full bg-dourado text-verde_petroleo font-serif font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-grow">
                    <p className="font-bold text-sm text-texto_principal">{c.nome}</p>
                    <p className="text-[10px] text-texto_secundario">{c.quantidade} compras totais</p>
                  </div>
                  <span className="font-serif font-black text-sm text-verde_escuro">{formatarMoeda(c.totalGasto)}</span>
                </div>
              ))}
              {(resumo?.clientesMaisCompram ?? []).length === 0 && (
                <p className="text-xs text-texto_secundario text-center py-6">Nenhuma compra registrada de clientes.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
