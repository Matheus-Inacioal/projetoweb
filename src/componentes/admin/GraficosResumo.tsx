"use client";

import { useState, useEffect } from "react";
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
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts";
import type { ResumoPainelAdmin } from "@/tipos/dados";

interface GraficosResumoProps {
  dados: ResumoPainelAdmin;
}

const CORES = ["#0F2F2A", "#174C43", "#C89B3C", "#E4D8C8", "#7A1F2B", "#526173"];

export function GraficosResumo({ dados }: GraficosResumoProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-96 flex items-center justify-center bg-off_white/50 rounded-2xl border border-bege_borda">
        <p className="text-texto_secundario font-medium">Carregando painel visual...</p>
      </div>
    );
  }

  return (
    <div className="grid gap-8 md:grid-cols-2">
      {/* 1. Contratações por Mês */}
      <div className="cartao p-6 space-y-4">
        <div>
          <h3 className="text-lg font-serif font-bold text-verde_petroleo">Contratações por Mês</h3>
          <p className="text-xs text-texto_secundario">Volume de agendamentos mensais concluídos</p>
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dados.contratacoesPorMes}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E4D8C8" />
              <XAxis dataKey="rotulo" stroke="#526173" fontSize={12} />
              <YAxis stroke="#526173" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: "#FFF8EF", borderRadius: 8, borderColor: "#E4D8C8" }} />
              <Bar dataKey="valor" fill="#174C43" radius={[4, 4, 0, 0]} name="Agendamentos" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Receita Mensal */}
      <div className="cartao p-6 space-y-4">
        <div>
          <h3 className="text-lg font-serif font-bold text-verde_petroleo">Receita Mensal (R$)</h3>
          <p className="text-xs text-texto_secundario">Faturamento consolidado de serviços e produtos</p>
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dados.receitaMensal}>
              <defs>
                <linearGradient id="corReceita" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C89B3C" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#C89B3C" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E4D8C8" />
              <XAxis dataKey="rotulo" stroke="#526173" fontSize={12} />
              <YAxis stroke="#526173" fontSize={12} />
              <Tooltip formatter={(v) => `R$ ${Number(v).toFixed(2)}`} contentStyle={{ backgroundColor: "#FFF8EF", borderRadius: 8, borderColor: "#E4D8C8" }} />
              <Area type="monotone" dataKey="valor" stroke="#C89B3C" fillOpacity={1} fill="url(#corReceita)" name="Receita" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Serviços mais Contratados */}
      <div className="cartao p-6 space-y-4">
        <div>
          <h3 className="text-lg font-serif font-bold text-verde_petroleo">Serviços Mais Procurados</h3>
          <p className="text-xs text-texto_secundario">Ranking de popularidade de serviços</p>
        </div>
        <div className="h-72 w-full flex flex-col md:flex-row items-center justify-between">
          <div className="h-56 w-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dados.servicosMaisContratados}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="quantidade"
                >
                  {dados.servicosMaisContratados.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CORES[index % CORES.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "#FFF8EF", borderRadius: 8, borderColor: "#E4D8C8" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 px-4 self-center space-y-2">
            {dados.servicosMaisContratados.map((item, index) => (
              <div key={item.nome} className="flex items-center gap-2 text-sm text-texto_principal">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: CORES[index % CORES.length] }} />
                <span className="truncate max-w-[150px]">{item.nome}</span>
                <span className="font-semibold ml-auto">{item.quantidade}x</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Produtos mais Vendidos */}
      <div className="cartao p-6 space-y-4">
        <div>
          <h3 className="text-lg font-serif font-bold text-verde_petroleo">Produtos Mais Vendidos</h3>
          <p className="text-xs text-texto_secundario">Itens com maior quantidade de saídas físicas</p>
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dados.produtosMaisVendidos} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#E4D8C8" />
              <XAxis type="number" stroke="#526173" fontSize={12} />
              <YAxis dataKey="nome" type="category" stroke="#526173" fontSize={11} width={100} />
              <Tooltip contentStyle={{ backgroundColor: "#FFF8EF", borderRadius: 8, borderColor: "#E4D8C8" }} />
              <Bar dataKey="quantidade" fill="#0F2F2A" radius={[0, 4, 4, 0]} name="Vendas" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 5. Prestadores mais Contratados */}
      <div className="cartao p-6 space-y-4">
        <div>
          <h3 className="text-lg font-serif font-bold text-verde_petroleo">Ranking de Barbeiros</h3>
          <p className="text-xs text-texto_secundario">Prestadores com maior número de atendimentos</p>
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dados.prestadoresMaisContratados}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E4D8C8" />
              <XAxis dataKey="nome" stroke="#526173" fontSize={12} />
              <YAxis stroke="#526173" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: "#FFF8EF", borderRadius: 8, borderColor: "#E4D8C8" }} />
              <Bar dataKey="quantidade" fill="#C89B3C" radius={[4, 4, 0, 0]} name="Atendimentos" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 6. Evolução de Usuários */}
      <div className="cartao p-6 space-y-4">
        <div>
          <h3 className="text-lg font-serif font-bold text-verde_petroleo">Evolução da Base de Clientes</h3>
          <p className="text-xs text-texto_secundario">Crescimento total de contas registradas</p>
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dados.evolucaoUsuarios}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E4D8C8" />
              <XAxis dataKey="rotulo" stroke="#526173" fontSize={12} />
              <YAxis stroke="#526173" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: "#FFF8EF", borderRadius: 8, borderColor: "#E4D8C8" }} />
              <Line type="monotone" dataKey="valor" stroke="#7A1F2B" strokeWidth={2} name="Usuários Totais" activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
