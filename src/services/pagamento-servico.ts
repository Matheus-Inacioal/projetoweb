import { MercadoPagoConfig, Payment } from "mercadopago";
import { criarClienteSupabaseServidor } from "@/lib/banco/supabase-server";
import { ErroAplicacao } from "@/lib/utilitarios/erro-aplicacao";
import type { StatusPagamento } from "@/tipos/enums";

// Configura o SDK do Mercado Pago
const mpAccessToken = process.env.MERCADOPAGO_ACCESS_TOKEN || "";
const isMockMode = !mpAccessToken || mpAccessToken === "SEU_ACCESS_TOKEN";

let paymentClient: Payment | null = null;
if (!isMockMode) {
  try {
    const config = new MercadoPagoConfig({ accessToken: mpAccessToken });
    paymentClient = new Payment(config);
  } catch (err) {
    console.warn("Falha ao inicializar o SDK do Mercado Pago. Entrando em Mock Mode.", err);
  }
}

export const pagamentoServico = {
  async criarPagamentoContratacao(contratacaoId: string) {
    const supabase = criarClienteSupabaseServidor();

    // 1. Busca dados do agendamento
    const { data: ag, error: agError } = await supabase
      .from("contratacoes")
      .select(`
        *,
        consumidores (
          usuarios (
            nome,
            email
          )
        ),
        servicos (
          nome
        )
      `)
      .eq("id", contratacaoId)
      .single();

    if (agError || !ag) {
      throw new ErroAplicacao("Contratação não encontrada para gerar pagamento.", 404);
    }

    // Validação: permitir PIX apenas para status 'confirmado' ou 'remarcado'
    if (ag.status !== "confirmado" && ag.status !== "remarcado") {
      throw new ErroAplicacao("O pagamento PIX só pode ser gerado após a contratação ser confirmada ou remarcada pelo prestador.", 400);
    }

    const valor = Number(ag.valor_total);
    const emailCliente = ag.consumidores?.usuarios?.email ?? "cliente@barbergo.com";
    const nomeCliente = ag.consumidores?.usuarios?.nome ?? "Cliente";
    const descricao = `BarberGo - Serviço: ${ag.servicos?.nome ?? "Corte"}`;

    // 2. Verifica se já existe um pagamento pendente ou aprovado
    const { data: pagamentoExistente } = await supabase
      .from("pagamentos")
      .select("*")
      .eq("contratacao_id", contratacaoId)
      .maybeSingle();

    if (pagamentoExistente) {
      if (pagamentoExistente.status === "aprovado") {
        return pagamentoExistente;
      }
      // Se for pendente, retorna o mesmo para evitar gerar novos no Mercado Pago
      if (pagamentoExistente.status === "pendente" && pagamentoExistente.qr_code) {
        return pagamentoExistente;
      }
    }

    let mpId = `MOCK-PAY-${Date.now()}`;
    let extRef = `AG-${contratacaoId}`;
    let qrCode = "00020101021226870014br.gov.bcb.pix2565pix.mercado-pago.com.br/qr/mock-pix-payload-barbergo-ag-payment";
    let qrCodeBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="; // 1x1 png transparente

    if (!isMockMode && paymentClient) {
      try {
        const urlBase = process.env.NEXT_PUBLIC_BASE_URL || "https://barbergo.vercel.app";
        const mpResponse = await paymentClient.create({
          body: {
            transaction_amount: valor,
            description: descricao,
            payment_method_id: "pix",
            payer: {
              email: emailCliente,
              first_name: nomeCliente.split(" ")[0] || "Cliente"
            },
            external_reference: extRef,
            notification_url: `${urlBase}/api/pagamentos/webhook`
          }
        });

        mpId = String(mpResponse.id);
        qrCode = mpResponse.point_of_interaction?.transaction_data?.qr_code ?? qrCode;
        qrCodeBase64 = mpResponse.point_of_interaction?.transaction_data?.qr_code_base64 ?? qrCodeBase64;
      } catch (err: any) {
        console.error("Erro ao gerar pagamento no Mercado Pago. Fallback para Mock.", err.message);
      }
    }

    // 3. Salva ou atualiza na tabela pagamentos
    const dadosPagamento = {
      contratacao_id: contratacaoId,
      mercado_pago_payment_id: mpId,
      external_reference: extRef,
      qr_code: qrCode,
      qr_code_base64: qrCodeBase64,
      valor: valor,
      status: "pendente" as StatusPagamento
    };

    let data;
    if (pagamentoExistente) {
      const { data: res, error: updError } = await supabase
        .from("pagamentos")
        .update(dadosPagamento)
        .eq("id", pagamentoExistente.id)
        .select()
        .single();
      if (updError) throw new ErroAplicacao(updError.message, 400);
      data = res;
    } else {
      const { data: res, error: insError } = await supabase
        .from("pagamentos")
        .insert(dadosPagamento)
        .select()
        .single();
      if (insError) throw new ErroAplicacao(insError.message, 400);
      data = res;
    }

    return data;
  },

  async criarPagamentoPedido(pedidoId: string) {
    const supabase = criarClienteSupabaseServidor();

    // 1. Busca dados do pedido
    const { data: pd, error: pdError } = await supabase
      .from("pedidos")
      .select(`
        *,
        consumidores (
          usuarios (
            nome,
            email
          )
        )
      `)
      .eq("id", pedidoId)
      .single();

    if (pdError || !pd) {
      throw new ErroAplicacao("Pedido não encontrado para gerar pagamento.", 404);
    }

    const valor = Number(pd.valor_total);
    const emailCliente = pd.consumidores?.usuarios?.email ?? "cliente@barbergo.com";
    const nomeCliente = pd.consumidores?.usuarios?.nome ?? "Cliente";
    const descricao = `BarberGo - Compra de Produtos Pedido #${pedidoId.slice(0, 8)}`;

    // 2. Verifica se já existe pagamento
    const { data: pagamentoExistente } = await supabase
      .from("pagamentos_produtos")
      .select("*")
      .eq("pedido_id", pedidoId)
      .maybeSingle();

    if (pagamentoExistente) {
      if (pagamentoExistente.status === "aprovado") {
        return pagamentoExistente;
      }
      if (pagamentoExistente.status === "pendente" && pagamentoExistente.qr_code) {
        return pagamentoExistente;
      }
    }

    let mpId = `MOCK-PROD-${Date.now()}`;
    let extRef = `PD-${pedidoId}`;
    let qrCode = "00020101021226870014br.gov.bcb.pix2565pix.mercado-pago.com.br/qr/mock-pix-payload-barbergo-pd-payment";
    let qrCodeBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

    if (!isMockMode && paymentClient) {
      try {
        const urlBase = process.env.NEXT_PUBLIC_BASE_URL || "https://barbergo.vercel.app";
        const mpResponse = await paymentClient.create({
          body: {
            transaction_amount: valor,
            description: descricao,
            payment_method_id: "pix",
            payer: {
              email: emailCliente,
              first_name: nomeCliente.split(" ")[0] || "Cliente"
            },
            external_reference: extRef,
            notification_url: `${urlBase}/api/pagamentos/webhook`
          }
        });

        mpId = String(mpResponse.id);
        qrCode = mpResponse.point_of_interaction?.transaction_data?.qr_code ?? qrCode;
        qrCodeBase64 = mpResponse.point_of_interaction?.transaction_data?.qr_code_base64 ?? qrCodeBase64;
      } catch (err: any) {
        console.error("Erro ao gerar pagamento de pedido no Mercado Pago. Fallback para Mock.", err.message);
      }
    }

    const dadosPagamento = {
      pedido_id: pedidoId,
      mercado_pago_payment_id: mpId,
      external_reference: extRef,
      qr_code: qrCode,
      qr_code_base64: qrCodeBase64,
      valor: valor,
      status: "pendente" as StatusPagamento
    };

    let data;
    if (pagamentoExistente) {
      const { data: res, error: updError } = await supabase
        .from("pagamentos_produtos")
        .update(dadosPagamento)
        .eq("id", pagamentoExistente.id)
        .select()
        .single();
      if (updError) throw new ErroAplicacao(updError.message, 400);
      data = res;
    } else {
      const { data: res, error: insError } = await supabase
        .from("pagamentos_produtos")
        .insert(dadosPagamento)
        .select()
        .single();
      if (insError) throw new ErroAplicacao(insError.message, 400);
      data = res;
    }

    return data;
  },

  async consultarStatusPagamento(mercadoPagoPaymentId: string) {
    // Simulação no modo acadêmico para aprovação instantânea ao consultar
    if (mercadoPagoPaymentId.startsWith("MOCK-")) {
      return { status: "approved" };
    }

    if (isMockMode || !paymentClient) {
      return { status: "pending" };
    }

    try {
      const response = await paymentClient.get({ id: mercadoPagoPaymentId });
      return { status: response.status };
    } catch (err: any) {
      console.error("Erro ao consultar status do pagamento:", err.message);
      return { status: "pending" };
    }
  },

  async processarWebhook(payload: any) {
    const supabase = criarClienteSupabaseServidor();

    // Valida se a notificação é de pagamento
    const tipo = payload.type || payload.action;
    const paymentId = payload.data?.id || payload.id;

    if (!paymentId || (tipo !== "payment" && tipo !== "payment.created" && tipo !== "payment.updated")) {
      return { recebido: true, mensagem: "Notificação ignorada." };
    }

    // Consulta status real ou simulado
    const statusData = await this.consultarStatusPagamento(String(paymentId));
    const mpStatus = statusData.status; // 'approved', 'rejected', 'pending', 'cancelled', 'refunded'

    // Mapeia status
    let statusNovo: StatusPagamento = "pendente";
    if (mpStatus === "approved") statusNovo = "aprovado";
    else if (mpStatus === "rejected") statusNovo = "rejeitado";
    else if (mpStatus === "cancelled") statusNovo = "cancelado";
    else if (mpStatus === "refunded") statusNovo = "estornado";

    // 1. Verifica se o pagamento é de Agendamento (external_reference starts with AG-)
    const { data: pagAg } = await supabase
      .from("pagamentos")
      .select("*, contratacoes(*, consumidores(*))")
      .eq("mercado_pago_payment_id", String(paymentId))
      .maybeSingle();

    if (pagAg) {
      const { error: updErr } = await supabase
        .from("pagamentos")
        .update({ status: statusNovo })
        .eq("id", pagAg.id);

      if (!updErr && statusNovo === "aprovado") {
        if (pagAg.contratacoes) {
          await supabase.from("historico_contratacoes").insert({
            contratacao_id: pagAg.contratacao_id,
            usuario_id: pagAg.contratacoes.consumidores?.usuario_id,
            acao: "Pagamento Aprovado",
            status_anterior: pagAg.contratacoes.status,
            status_novo: pagAg.contratacoes.status,
            observacao: `Pagamento PIX de R$ ${pagAg.valor} aprovado.`
          });
        }
      }
      return { processado: true, tipo: "agendamento", status: statusNovo };
    }

    // 2. Verifica se o pagamento é de Pedido de Produtos
    const { data: pagPd } = await supabase
      .from("pagamentos_produtos")
      .select("*")
      .eq("mercado_pago_payment_id", String(paymentId))
      .maybeSingle();

    if (pagPd) {
      const { error: updErr } = await supabase
        .from("pagamentos_produtos")
        .update({ status: statusNovo })
        .eq("id", pagPd.id);

      if (!updErr && statusNovo === "aprovado") {
        // Atualiza status do pedido
        await supabase
          .from("pedidos")
          .update({ status: "pago" })
          .eq("id", pagPd.pedido_id);
      }
      return { processado: true, tipo: "pedido", status: statusNovo };
    }

    return { processado: false, mensagem: "Pagamento não encontrado na base de dados." };
  }
};
