"use client";

import { useState, useEffect } from "react";
import { criarClienteSupabaseNavegador } from "@/lib/banco/supabase-client";
import { EstadoCarregando } from "@/componentes/feedback/EstadoCarregando";
import { Calendar, Download, Printer, Filter, DollarSign, Award, Scissors, ShoppingBag } from "lucide-react";
import toast from "react-hot-toast";

interface Filtros {
  dataInicio: string;
  dataFim: string;
  prestadorId: string;
  status: string;
  tipo: "todos" | "servicos" | "produtos";
}

interface LinhaRelatorio {
  data: string;
  cliente: string;
  prestador: string;
  item: string;
  tipo: "Serviço" | "Produto";
  valor: number;
  status: string;
}

export default function RelatoriosPage() {
  const [carregando, setCarregando] = useState(true);
  const [prestadores, setPrestadores] = useState<{ id: string; nome: string }[]>([]);
  const [dadosGerais, setDadosGerais] = useState<LinhaRelatorio[]>([]);
  
  // Filters state
  const [filtros, setFiltros] = useState<Filtros>({
    dataInicio: "",
    dataFim: "",
    prestadorId: "todos",
    status: "todos",
    tipo: "todos"
  });

  const supabase = criarClienteSupabaseNavegador();

  const carregarDadosBase = async () => {
    try {
      setCarregando(true);
      
      // 1. Carrega prestadores
      const { data: pData } = await supabase.from("prestadores").select("id, usuarios(nome)");
      setPrestadores(
        (pData || []).map((p: any) => ({
          id: p.id,
          nome: p.usuarios?.nome || "Barbeiro"
        }))
      );

      // 2. Carrega agendamentos
      const { data: ags, error: sErr } = await supabase
        .from("vw_agendamentos_detalhados")
        .select("*");
      if (sErr) throw sErr;

      // 3. Carrega vendas de produtos
      const { data: pds, error: pErr } = await supabase
        .from("pedido_itens")
        .select("*, pedidos(created_at, status, consumidores(usuarios(nome))), produtos(nome, prestadores(usuarios(nome)))");
      if (pErr) throw pErr;

      // Unificar dados
      const servicosMapeados: LinhaRelatorio[] = (ags || []).map((a: any) => ({
        data: a.agenda_data || a.created_at.split("T")[0],
        cliente: a.consumidor_nome || "Cliente",
        prestador: a.prestador_nome || "Profissional",
        item: a.servico_nome || "Serviço",
        tipo: "Serviço",
        valor: Number(a.valor),
        status: a.status
      }));

      const produtosMapeados: LinhaRelatorio[] = (pds || []).map((p: any) => ({
        data: (p.pedidos?.created_at || "").split("T")[0],
        cliente: p.pedidos?.consumidores?.usuarios?.nome || "Cliente",
        prestador: p.produtos?.prestadores?.usuarios?.nome || "Loja",
        item: p.produtos?.nome || "Produto",
        tipo: "Produto",
        valor: Number(p.preco_unitario || 0) * Number(p.quantidade || 0),
        status: p.pedidos?.status || "pendente"
      }));

      setDadosGerais([...servicosMapeados, ...produtosMapeados]);
    } catch (err: any) {
      toast.error("Erro ao gerar relatórios: " + err.message);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarDadosBase();
  }, []);

  const dadosFiltrados = dadosGerais.filter(item => {
    const dataOk = (!filtros.dataInicio || item.data >= filtros.dataInicio) &&
                  (!filtros.dataFim || item.data <= filtros.dataFim);
    const prestadorOk = filtros.prestadorId === "todos" || item.prestador.includes(
      prestadores.find(p => p.id === filtros.prestadorId)?.nome || ""
    );
    const statusOk = filtros.status === "todos" || item.status === filtros.status;
    const tipoOk = filtros.tipo === "todos" || 
                   (filtros.tipo === "servicos" && item.tipo === "Serviço") ||
                   (filtros.tipo === "produtos" && item.tipo === "Produto");

    return dataOk && prestadorOk && statusOk && tipoOk;
  });

  // KPI Calculations
  const totalFaturamento = dadosFiltrados
    .filter(d => ["confirmado", "remarcado", "concluido", "pago", "aprovado", "entregue"].includes(d.status))
    .reduce((acc, curr) => acc + curr.valor, 0);
  const quantidadeVendas = dadosFiltrados.length;
  const totalAgendamentos = dadosFiltrados.filter(d => d.tipo === "Serviço").length;
  const totalProdutos = dadosFiltrados.filter(d => d.tipo === "Produto").length;

  const exportarCSV = () => {
    const colunas = ["Data", "Cliente", "Prestador", "Item", "Tipo", "Valor (R$)", "Status"];
    const cabecalho = colunas.join(";");
    const linhas = dadosFiltrados.map(d => 
      `"${d.data}";"${d.cliente}";"${d.prestador}";"${d.item}";"${d.tipo}";"${d.valor.toFixed(2)}";"${d.status}"`
    );
    const csvContent = "\uFEFF" + [cabecalho, ...linhas].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `relatorio_barbergo_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV exportado com sucesso!");
  };

  const exportarPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <p className="texto-destaque mb-1">Módulos de Controle</p>
          <h1 className="text-3xl font-serif font-bold text-verde_petroleo">Relatórios Gerenciais</h1>
          <p className="text-sm text-texto_secundario">Gere relatórios customizados, aplique filtros de período e exporte dados para CSV ou PDF.</p>
        </div>
        <div className="flex items-center gap-3 self-start">
          <button
            onClick={exportarCSV}
            className="botao-secundario py-2 px-4 flex items-center gap-2 text-xs font-semibold"
          >
            <Download className="w-4 h-4" />
            Exportar CSV
          </button>
          <button
            onClick={exportarPDF}
            className="botao-primario py-2 px-4 flex items-center gap-2 text-xs font-semibold"
          >
            <Printer className="w-4 h-4" />
            Imprimir PDF
          </button>
        </div>
      </div>

      {/* Título de Impressão (Apenas visível no PDF/Print) */}
      <div className="hidden print:block text-center border-b border-bege_borda pb-4">
        <h1 className="text-3xl font-serif font-bold text-verde_petroleo">BarberGo — Relatório de Atividades</h1>
        <p className="text-xs text-texto_secundario mt-1">Gerado em: {new Date().toLocaleDateString("pt-BR")}</p>
      </div>

      {/* Painel de Filtros (Escondido na impressão) */}
      <div className="bg-off_white p-6 rounded-xl border border-bege_borda shadow-suave space-y-4 print:hidden">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-verde_escuro flex items-center gap-2">
          <Filter className="w-4 h-4 text-dourado" />
          Filtros de Pesquisa
        </h2>
        
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <label className="block text-[10px] font-semibold text-texto_secundario uppercase mb-1">Data Inicial</label>
            <input
              type="date"
              className="campo-base py-2 text-xs"
              value={filtros.dataInicio}
              onChange={(e) => setFiltros({ ...filtros, dataInicio: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-texto_secundario uppercase mb-1">Data Final</label>
            <input
              type="date"
              className="campo-base py-2 text-xs"
              value={filtros.dataFim}
              onChange={(e) => setFiltros({ ...filtros, dataFim: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-texto_secundario uppercase mb-1">Prestador</label>
            <select
              className="campo-base py-2 text-xs font-medium"
              value={filtros.prestadorId}
              onChange={(e) => setFiltros({ ...filtros, prestadorId: e.target.value })}
            >
              <option value="todos">Todos</option>
              {prestadores.map(p => (
                <option key={p.id} value={p.id}>{p.nome}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-texto_secundario uppercase mb-1">Status</label>
            <select
              className="campo-base py-2 text-xs font-medium"
              value={filtros.status}
              onChange={(e) => setFiltros({ ...filtros, status: e.target.value })}
            >
              <option value="todos">Todos</option>
              <option value="pago">Pago / Aprovado</option>
              <option value="pendente">Pendente / Aguardando</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-texto_secundario uppercase mb-1">Categoria</label>
            <select
              className="campo-base py-2 text-xs font-medium"
              value={filtros.tipo}
              onChange={(e) => setFiltros({ ...filtros, tipo: e.target.value as any })}
            >
              <option value="todos">Todos (Serviços + Produtos)</option>
              <option value="servicos">Apenas Serviços</option>
              <option value="produtos">Apenas Produtos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Indicadores do Relatório */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <div className="cartao p-4 bg-emerald-50/50 border-emerald-100 flex items-center gap-3">
          <DollarSign className="w-5 h-5 text-emerald-700" />
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-texto_secundario">Faturamento Aprovado</p>
            <p className="text-xl font-bold text-emerald-700">R$ {totalFaturamento.toFixed(2)}</p>
          </div>
        </div>

        <div className="cartao p-4 bg-verde_petroleo/5 border-bege_borda flex items-center gap-3">
          <Calendar className="w-5 h-5 text-verde_escuro" />
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-texto_secundario">Total de Movimentações</p>
            <p className="text-xl font-bold text-primaria">{quantidadeVendas} lançamentos</p>
          </div>
        </div>

        <div className="cartao p-4 bg-indigo-50/50 border-indigo-100 flex items-center gap-3">
          <Scissors className="w-5 h-5 text-indigo-700" />
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-texto_secundario">Agendamentos</p>
            <p className="text-xl font-bold text-indigo-700">{totalAgendamentos} contratados</p>
          </div>
        </div>

        <div className="cartao p-4 bg-cyan-50/50 border-cyan-100 flex items-center gap-3">
          <ShoppingBag className="w-5 h-5 text-cyan-700" />
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-texto_secundario">Vendas de E-commerce</p>
            <p className="text-xl font-bold text-cyan-700">{totalProdutos} unidades</p>
          </div>
        </div>
      </div>

      {/* Tabela do Relatório */}
      {carregando ? (
        <EstadoCarregando texto="Consolidando dados das transações..." />
      ) : (
        <div className="cartao overflow-x-auto print:border-0 print:shadow-none">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-verde_petroleo/5 border-b border-bege_borda text-xs font-semibold text-verde_petroleo uppercase tracking-wider">
                <th className="p-4">Data</th>
                <th className="p-4">Tipo</th>
                <th className="p-4">Item (Serviço/Produto)</th>
                <th className="p-4">Cliente</th>
                <th className="p-4">Profissional / Loja</th>
                <th className="p-4">Preço</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bege_borda text-sm text-texto_principal">
              {dadosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-texto_secundario font-medium">
                    Nenhum lançamento no período atende aos critérios informados.
                  </td>
                </tr>
              ) : (
                dadosFiltrados.map((item, idx) => (
                  <tr key={idx} className="hover:bg-bege_borda/10 transition print:hover:bg-transparent">
                    <td className="p-4 font-medium">
                      {item.data && item.data.includes("-") 
                        ? item.data.split("-").reverse().join("/") 
                        : item.data || "--/--/----"}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold ${
                        item.tipo === "Serviço" ? "bg-indigo-50 text-indigo-700" : "bg-cyan-50 text-cyan-700"
                      }`}>
                        {item.tipo}
                      </span>
                    </td>
                    <td className="p-4 font-semibold text-verde_petroleo">{item.item}</td>
                    <td className="p-4 text-texto_secundario">{item.cliente}</td>
                    <td className="p-4 text-texto_secundario">{item.prestador}</td>
                    <td className="p-4 font-serif font-bold text-verde_escuro">
                      R$ {item.valor.toFixed(2)}
                    </td>
                    <td className="p-4">
                      <span className="capitalize font-semibold text-xs text-dourado">
                        {item.status.replace("_", " ")}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
