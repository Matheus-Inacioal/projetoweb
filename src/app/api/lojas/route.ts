import { obterSessaoObrigatoriaApi } from "@/lib/autenticacao/sessao";
import { lojaServico } from "@/services/loja-servico";
import { responderErro, responderSucesso } from "@/lib/utilitarios/respostas-api";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cidade = searchParams.get("cidade") || undefined;
    const termo = searchParams.get("termo") || undefined;

    const lojas = await lojaServico.listarLojas({ cidade, termo });
    return responderSucesso(lojas, "Lojas carregadas com sucesso.");
  } catch (erro) {
    return responderErro(erro);
  }
}

export async function POST(request: Request) {
  try {
    // Apenas Administrador Geral pode criar novas lojas na plataforma
    await obterSessaoObrigatoriaApi(["admin"]);

    const dados = await request.json();
    const novaLoja = await lojaServico.criarLoja(dados);

    return responderSucesso(novaLoja, "Loja criada com sucesso.", 201);
  } catch (erro) {
    return responderErro(erro);
  }
}
