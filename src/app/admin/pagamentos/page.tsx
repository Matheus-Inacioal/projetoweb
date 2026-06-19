"use client";

import { useState, useEffect } from "react";
import { criarClienteSupabaseNavegador } from "@/lib/banco/supabase-client";
import { EstadoCarregando } from "@/componentes/feedback/EstadoCarregando";
import { Search, Filter, DollarSign, CheckCircle2, AlertCircle, RefreshCw, X } from "lucide-react";
import toast from "react-hot-toast";

interface PagamentoUnificado {
  id: string;
  referencia: string;
  payment_id: string | null;
  valor: number;
  status: string;
  created_at: string;
  tipo: "Serviço" | "Produto";
  cliente: string;
  detalhe: string;
  qr_code: string | null;
  qr_code_base64: string | null;
}

export default function PagamentosAdminPage() {
  const [pagamentos, setPagamentos] = useState<PagamentoUnificado[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [filtroTipo, setFiltroTipo] = useState("todos");
  
  // View QR code modal
  const [pixVisualizando, setPixVisualizando] = useState<PagamentoUnificado | null>(null);

  const supabase = criarClienteSupabaseNavegador();

  const carregarPagamentos = async () => {
    try {
      setCarregando(true);

      // 1. Busca pagamentos de serviços
      const { data: servs, error: sErr } = await supabase
        .from("pagamentos")
        .select("*, agendamentos(consumidores(usuarios(nome)), prestadores(usuarios(nome)))");
      if (sErr) throw sErr;

      // 2. Busca pagamentos de produtos
      const { data: prods, error: pErr } = await supabase
        .from("pagamentos_produtos")
        .select("*, pedidos(consumidores(usuarios(nome)))");
      if (pErr) throw pErr;

      // 3. Unifica as duas listas
      const listaServicos: PagamentoUnificado[] = (servs || []).map((s: any) => ({
        id: s.id,
        referencia: s.external_reference,
        payment_id: s.mercado_pago_payment_id,
        valor: Number(s.valor),
        status: s.status,
        created_at: s.created_at,
        tipo: "Serviço",
        cliente: s.agendamentos?.consumidores?.usuarios?.nome || "Cliente",
        detalhe: `Agendamento c/ ${s.agendamentos?.prestadores?.usuarios?.nome || "Barbeiro"}`,
        qr_code: s.qr_code,
        qr_code_base64: s.qr_code_base64
      }));

      const listaProdutos: PagamentoUnificado[] = (prods || []).map((p: any) => ({
        id: p.id,
        referencia: p.external_reference,
        payment_id: p.mercado_pago_payment_id,
        valor: Number(p.valor),
        status: p.status,
        created_at: p.created_at,
        tipo: "Produto",
        cliente: p.pedidos?.consumidores?.usuarios?.nome || "Cliente",
        detalhe: `Pedido #${p.pedido_id.slice(0, 8).toUpperCase()}`,
        qr_code: p.qr_code,
        qr_code_base64: p.qr_code_base64
      }));

      const unificada = [...listaServicos, ...listaProdutos].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setPagamentos(unificada);
    } catch (err: any) {
      toast.error("Erro ao carregar lançamentos financeiros: " + err.message);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarPagamentos();
  }, []);

  const filtrados = pagamentos.filter(p => {
    const query = busca.toLowerCase();
    const matchesBusca =
      p.cliente.toLowerCase().includes(query) ||
      p.detalhe.toLowerCase().includes(query) ||
      p.referencia.toLowerCase().includes(query);

    const matchesStatus = filtroStatus === "todos" || p.status === filtroStatus;
    const matchesTipo = filtroTipo === "todos" || p.tipo === filtroTipo;

    return matchesBusca && matchesStatus && matchesTipo;
  });

  // Finance metrics
  const totalArrecadado = filtrados.filter(p => p.status === "aprovado").reduce((acc, curr) => acc + curr.valor, 0);
  const totalPendente = filtrados.filter(p => p.status === "pendente").reduce((acc, curr) => acc + curr.valor, 0);

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(valor);
  };

  const formatarData = (dataSql: string) => {
    return new Date(dataSql).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="texto-destaque mb-1">Módulos de Controle</p>
          <h1 className="text-3xl font-serif font-bold text-verde_petroleo">Gestão Financeira (PIX)</h1>
          <p className="text-sm text-texto_secundario">Monitore faturamento em tempo real, audite links de pagamentos e cheque status do webhook.</p>
        </div>
        <button
          onClick={carregarPagamentos}
          className="botao-secundario self-start py-2 px-4 flex items-center gap-2 text-xs"
        >
          <RefreshCw className="w-4 h-4" />
          Atualizar Lançamentos
        </button>
      </div>

      {/* Cartões Financeiros do Período */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="cartao p-6 flex items-center gap-4">
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-700">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-texto_secundario">Valor Arrecadado (Aprovado)</p>
            <p className="text-2xl font-bold text-emerald-700 mt-1">{formatarMoeda(totalArrecadado)}</p>
          </div>
        </div>

        <div className="cartao p-6 flex items-center gap-4">
          <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-texto_secundario">Previsão Pendente (Pendente)</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{formatarMoeda(totalPendente)}</p>
          </div>
        </div>

        <div className="cartao p-6 flex items-center gap-4">
          <div className="p-3 bg-verde_petroleo/5 rounded-xl text-verde_petroleo">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-texto_secundario">Total de Lançamentos</p>
            <p className="text-2xl font-bold text-primaria mt-1">{filtrados.length} PIX gerados</p>
          </div>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="flex flex-col md:flex-row gap-4 items-center bg-off_white p-4 rounded-xl border border-bege_borda shadow-suave">
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-texto_secundario" />
          <input
            type="text"
            placeholder="Buscar por cliente, pedido ou referência externa..."
            className="campo-base pl-10"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-texto_secundario shrink-0" />
          <select
            className="campo-base py-2"
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
          >
            <option value="todos">Todos os Status</option>
            <option value="pendente">Pendente</option>
            <option value="aprovado">Aprovado</option>
            <option value="rejeitado">Rejeitado</option>
            <option value="cancelado">Cancelado</option>
            <option value="estornado">Estornado</option>
          </select>

          <select
            className="campo-base py-2"
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
          >
            <option value="todos">Todos os Tipos</option>
            <option value="Serviço">Agendamentos</option>
            <option value="Produto">E-commerce</option>
          </select>
        </div>
      </div>

      {/* Tabela Financeira */}
      {carregando ? (
        <EstadoCarregando texto="Auditando caixa..." />
      ) : (
        <div className="cartao overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-verde_petroleo/5 border-b border-bege_borda text-xs font-semibold text-verde_petroleo uppercase tracking-wider">
                <th className="p-4">Tipo</th>
                <th className="p-4">Cliente</th>
                <th className="p-4">Referência de Lançamento</th>
                <th className="p-4">Data / Hora</th>
                <th className="p-4">Mercado Pago ID</th>
                <th className="p-4">Preço</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">PIX</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bege_borda text-sm text-texto_principal">
              {filtrados.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-texto_secundario font-medium">
                    Nenhuma transação financeira encontrada.
                  </td>
                </tr>
              ) : (
                filtrados.map((p) => (
                  <tr key={p.id} className="hover:bg-bege_borda/10 transition">
                    <td className="p-4">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${
                        p.tipo === "Serviço" ? "bg-indigo-50 text-indigo-700" : "bg-cyan-50 text-cyan-700"
                      }`}>
                        {p.tipo}
                      </span>
                    </td>
                    <td className="p-4 font-semibold text-verde_petroleo">{p.cliente}</td>
                    <td className="p-4">
                      <div>
                        <p className="text-texto_principal font-medium">{p.detalhe}</p>
                        <p className="text-[10px] text-texto_secundario font-mono truncate max-w-[150px]" title={p.referencia}>
                          Ref: {p.referencia}
                        </p>
                      </div>
                    </td>
                    <td className="p-4 text-texto_secundario">{formatarData(p.created_at)}</td>
                    <td className="p-4 text-texto_secundario font-mono">
                      {p.payment_id || "Não aprovado/processado"}
                    </td>
                    <td className="p-4 font-serif font-bold text-verde_escuro">
                      {formatarMoeda(p.valor)}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        {
                          aprovado: "bg-emerald-100 text-emerald-800",
                          pendente: "bg-amber-100 text-amber-800",
                          rejeitado: "bg-rose-100 text-rose-800",
                          cancelado: "bg-slate-200 text-slate-800",
                          estornado: "bg-indigo-100 text-indigo-800"
                        }[p.status] || "bg-gray-100 text-gray-800"
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      {p.qr_code_base64 ? (
                        <button
                          onClick={() => setPixVisualizando(p)}
                          className="botao-secundario px-2.5 py-1 text-xs"
                        >
                          Ver QR
                        </button>
                      ) : (
                        <span className="text-xs text-texto_secundario italic">Inexistente</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal QR Code */}
      {pixVisualizando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-off_white rounded-2xl border border-bege_borda shadow-premium w-full max-w-sm p-6 relative text-center">
            <button
              onClick={() => setPixVisualizando(null)}
              className="absolute right-4 top-4 p-1 hover:bg-bege_borda/20 rounded-full text-texto_secundario transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-serif font-bold text-verde_petroleo mb-1">
              QR Code do Pagamento
            </h3>
            <p className="text-xs text-texto_secundario mb-4">
              Valor: {formatarMoeda(pixVisualizando.valor)} | Ref: {pixVisualizando.referencia.slice(0, 12)}
            </p>

            {/* QR Code image */}
            {pixVisualizando.qr_code_base64 && (
              <div className="bg-white p-4 rounded-xl border border-bege_borda inline-block mx-auto mb-4">
                <img
                  src={`data:image/png;base64,${pixVisualizando.qr_code_base64}`}
                  alt="Mercado Pago PIX QR Code"
                  className="w-48 h-48 mx-auto"
                />
              </div>
            )}

            {/* Copy paste input */}
            {pixVisualizando.qr_code && (
              <div className="space-y-2">
                <p className="text-left text-xs font-semibold text-texto_secundario uppercase">Código PIX Copia e Cola</p>
                <textarea
                  readOnly
                  onClick={(e) => {
                    (e.target as any).select();
                    navigator.clipboard.writeText(pixVisualizando.qr_code || "");
                    toast.success("Código PIX copiado!");
                  }}
                  className="w-full text-xs bg-marfim border border-bege_borda rounded-lg p-2 font-mono h-16 resize-none cursor-pointer outline-none focus:ring-1 focus:ring-dourado"
                  value={pixVisualizando.qr_code}
                />
                <p className="text-[10px] text-texto_secundario">Clique acima para copiar automaticamente o código.</p>
              </div>
            )}

            <button
              onClick={() => setPixVisualizando(null)}
              className="botao-primario w-full mt-6 py-2 text-xs"
            >
              Voltar ao Extrato
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
