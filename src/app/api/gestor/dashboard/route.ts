import { obterSessaoObrigatoriaApi } from "@/lib/autenticacao/sessao";
import { criarClienteSupabaseServidor } from "@/lib/banco/supabase-server";
import { responderErro, responderSucesso } from "@/lib/utilitarios/respostas-api";
import { ErroAplicacao } from "@/lib/utilitarios/erro-aplicacao";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const sessao = await obterSessaoObrigatoriaApi(["gestor_loja", "admin"]);
    const supabase = criarClienteSupabaseServidor();

    let lojaId = "";
    if (sessao.tipoUsuario === "gestor_loja") {
      const { data: gestor, error: gError } = await supabase
        .from("gestores")
        .select("loja_id")
        .eq("usuario_id", sessao.usuarioId)
        .single();
      if (gError || !gestor) {
        throw new ErroAplicacao("Gestor não associado a nenhuma loja.", 403);
      }
      lojaId = gestor.loja_id;
    } else {
      const { searchParams } = new URL(request.url);
      lojaId = searchParams.get("lojaId") || "00000000-0000-0000-0000-000000000000";
    }

    // Busca Contratações da Loja
    const { data: contratacoes, error: cError } = await supabase
      .from("contratacoes")
      .select(`
        id,
        valor_total,
        status,
        created_at,
        prestador_id,
        consumidor_id,
        servico_id,
        servicos (nome),
        prestadores (usuarios (nome)),
        consumidores (usuarios (nome)),
        agenda (data, hora_inicio)
      `)
      .eq("loja_id", lojaId);

    if (cError) throw new ErroAplicacao(cError.message, 400);

    // Busca Itens de Pedido da Loja
    const { data: itensPedido, error: pError } = await supabase
      .from("pedido_itens")
      .select(`
        quantidade,
        preco_unitario,
        created_at,
        produtos!inner (
          loja_id,
          nome
        ),
        pedidos!inner (
          id,
          consumidor_id,
          status,
          consumidores (usuarios (nome))
        )
      `)
      .eq("produtos.loja_id", lojaId);

    if (pError) throw new ErroAplicacao(pError.message, 400);

    const hoje = new Date().toISOString().split("T")[0];
    const esteMes = new Date().toISOString().slice(0, 7);
    const esteAno = new Date().getFullYear().toString();

    let faturamentoHoje = 0;
    let faturamentoMes = 0;
    let faturamentoAnual = 0;
    let totalAgendamentos = 0;
    let totalProdutosVendidos = 0;

    const clientesUnicos = new Set<string>();
    const novosClientesSet = new Set<string>();

    contratacoes?.forEach((c: any) => {
      const dataCriacao = c.created_at?.split("T")[0];
      const mesCriacao = c.created_at?.slice(0, 7);
      const anoCriacao = c.created_at?.slice(0, 4);

      if (["concluido", "confirmado", "remarcado"].includes(c.status)) {
        totalAgendamentos++;
        const valor = Number(c.valor_total || 0);

        if (dataCriacao === hoje) faturamentoHoje += valor;
        if (mesCriacao === esteMes) faturamentoMes += valor;
        if (anoCriacao === esteAno) faturamentoAnual += valor;

        if (c.consumidor_id) {
          clientesUnicos.add(c.consumidor_id);
          if (mesCriacao === esteMes) {
            novosClientesSet.add(c.consumidor_id);
          }
        }
      }
    });

    itensPedido?.forEach((it: any) => {
      const status = it.pedidos?.status;
      if (["pago", "enviado", "entregue"].includes(status)) {
        const dataCriacao = it.created_at?.split("T")[0];
        const mesCriacao = it.created_at?.slice(0, 7);
        const anoCriacao = it.created_at?.slice(0, 4);

        const qtd = Number(it.quantidade || 0);
        const valor = Number(it.preco_unitario || 0) * qtd;

        totalProdutosVendidos += qtd;
        if (dataCriacao === hoje) faturamentoHoje += valor;
        if (mesCriacao === esteMes) faturamentoMes += valor;
        if (anoCriacao === esteAno) faturamentoAnual += valor;

        if (it.pedidos?.consumidor_id) {
          clientesUnicos.add(it.pedidos.consumidor_id);
          if (mesCriacao === esteMes) {
            novosClientesSet.add(it.pedidos.consumidor_id);
          }
        }
      }
    });

    // Calcula ticket médio
    const totalOperacoesMes = 
      contratacoes.filter((c: any) => c.created_at?.slice(0, 7) === esteMes && ["concluido", "confirmado", "remarcado"].includes(c.status)).length +
      (itensPedido?.filter((i: any) => i.created_at?.slice(0, 7) === esteMes && ["pago", "enviado", "entregue"].includes(i.pedidos?.status)).length || 0);
    const ticketMedio = totalOperacoesMes > 0 ? faturamentoMes / totalOperacoesMes : 0;

    // Receita por mês (últimos 12 meses)
    const mesesRotulos = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const obterUltimos12Meses = () => {
      const result = [];
      const d = new Date();
      for (let i = 11; i >= 0; i--) {
        const target = new Date(d.getFullYear(), d.getMonth() - i, 1);
        result.push({
          anoMes: `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, "0")}`,
          rotulo: `${mesesRotulos[target.getMonth()]}/${String(target.getFullYear()).slice(-2)}`
        });
      }
      return result;
    };

    const ultimos12Meses = obterUltimos12Meses();
    const receitaMensal = ultimos12Meses.map(m => {
      const receitaServ = contratacoes
        ?.filter((c: any) => c.created_at?.startsWith(m.anoMes) && ["concluido", "confirmado", "remarcado"].includes(c.status))
        .reduce((acc, curr) => acc + Number(curr.valor_total || 0), 0) || 0;

      const receitaProd = itensPedido
        ?.filter((it: any) => it.created_at?.startsWith(m.anoMes) && ["pago", "enviado", "entregue"].includes(it.pedidos?.status))
        .reduce((acc, curr) => acc + (Number(curr.preco_unitario || 0) * Number(curr.quantidade || 0)), 0) || 0;

      return {
        rotulo: m.rotulo,
        valor: receitaServ + receitaProd
      };
    });

    // Serviços mais vendidos (Top 10)
    const servicosContagem: Record<string, number> = {};
    contratacoes?.forEach((c: any) => {
      if (["concluido", "confirmado", "remarcado"].includes(c.status)) {
        const nome = c.servicos?.nome || "Outros";
        servicosContagem[nome] = (servicosContagem[nome] || 0) + 1;
      }
    });
    const servicosMaisVendidos = Object.entries(servicosContagem)
      .map(([nome, quantidade]) => ({ nome, quantidade }))
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 10);

    // Produtos mais vendidos (Top 10)
    const produtosContagem: Record<string, number> = {};
    itensPedido?.forEach((it: any) => {
      if (["pago", "enviado", "entregue"].includes(it.pedidos?.status)) {
        const nome = it.produtos?.nome || "Outros";
        produtosContagem[nome] = (produtosContagem[nome] || 0) + Number(it.quantidade || 0);
      }
    });
    const produtosMaisVendidos = Object.entries(produtosContagem)
      .map(([nome, quantidade]) => ({ nome, quantidade }))
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 10);

    // Horários mais movimentados (Mapa de calor)
    const horasContagem: Record<string, number> = {};
    contratacoes?.forEach((c: any) => {
      if (c.agenda?.hora_inicio && ["concluido", "confirmado", "remarcado"].includes(c.status)) {
        const hora = c.agenda.hora_inicio.slice(0, 2) + ":00";
        horasContagem[hora] = (horasContagem[hora] || 0) + 1;
      }
    });
    const horariosMovimentados = Object.entries(horasContagem)
      .map(([hora, quantidade]) => ({ hora, quantidade }))
      .sort((a, b) => a.hora.localeCompare(b.hora));

    // Prestadores mais produtivos (Ranking)
    const prestadoresContagem: Record<string, { nome: string; quantidade: number; faturamento: number }> = {};
    contratacoes?.forEach((c: any) => {
      if (["concluido", "confirmado", "remarcado"].includes(c.status)) {
        const pid = c.prestador_id;
        const nome = c.prestadores?.usuarios?.nome || "Barbeiro";
        const valor = Number(c.valor_total || 0);
        if (!prestadoresContagem[pid]) {
          prestadoresContagem[pid] = { nome, quantidade: 0, faturamento: 0 };
        }
        prestadoresContagem[pid].quantidade += 1;
        prestadoresContagem[pid].faturamento += valor;
      }
    });
    const prestadoresMaisProdutivos = Object.values(prestadoresContagem)
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 10);

    // Clientes que mais compram (Ranking)
    const clientesContagem: Record<string, { nome: string; quantidade: number; totalGasto: number }> = {};
    contratacoes?.forEach((c: any) => {
      if (["concluido", "confirmado", "remarcado"].includes(c.status)) {
        const cid = c.consumidor_id;
        const nome = c.consumidores?.usuarios?.nome || "Cliente";
        const valor = Number(c.valor_total || 0);
        if (!clientesContagem[cid]) {
          clientesContagem[cid] = { nome, quantidade: 0, totalGasto: 0 };
        }
        clientesContagem[cid].quantidade += 1;
        clientesContagem[cid].totalGasto += valor;
      }
    });
    itensPedido?.forEach((it: any) => {
      if (["pago", "enviado", "entregue"].includes(it.pedidos?.status)) {
        const cid = it.pedidos.consumidor_id;
        const nome = it.pedidos.consumidores?.usuarios?.nome || "Cliente";
        const valor = Number(it.preco_unitario || 0) * Number(it.quantidade || 0);
        if (!clientesContagem[cid]) {
          clientesContagem[cid] = { nome, quantidade: 0, totalGasto: 0 };
        }
        clientesContagem[cid].quantidade += Number(it.quantidade || 0);
        clientesContagem[cid].totalGasto += valor;
      }
    });
    const clientesMaisCompram = Object.values(clientesContagem)
      .sort((a, b) => b.totalGasto - a.totalGasto)
      .slice(0, 10);

    return responderSucesso({
      lojaId,
      faturamentoHoje,
      faturamentoMes,
      faturamentoAnual,
      totalAgendamentos,
      totalProdutosVendidos,
      ticketMedio,
      clientesAtivos: clientesUnicos.size,
      novosClientes: novosClientesSet.size,
      receitaMensal,
      servicosMaisVendidos,
      produtosMaisVendidos,
      horariosMovimentados,
      prestadoresMaisProdutivos,
      clientesMaisCompram
    }, "Métricas do dashboard da loja carregadas com sucesso.");
  } catch (erro) {
    return responderErro(erro);
  }
}
