import { pagamentoServico } from "@/services/pagamento-servico";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    console.log("Recebido Webhook do Mercado Pago:", JSON.stringify(payload));

    const resultado = await pagamentoServico.processarWebhook(payload);

    return NextResponse.json({ sucesso: true, resultado });
  } catch (erro) {
    console.error("Erro ao processar webhook do Mercado Pago:", erro);
    // Retornamos 200/202 para evitar que o Mercado Pago fique reenviando em loops se for um erro de parsing
    return NextResponse.json({ sucesso: false, erro: String(erro) }, { status: 202 });
  }
}
