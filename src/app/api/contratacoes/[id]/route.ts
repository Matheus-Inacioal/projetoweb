import { obterSessaoObrigatoriaApi } from "@/lib/autenticacao/sessao";
import { contratacaoServico } from "@/services/contratacao-servico";
import { responderErro, responderSucesso } from "@/lib/utilitarios/respostas-api";
import { ErroAplicacao } from "@/lib/utilitarios/erro-aplicacao";
import type { StatusContratacao } from "@/tipos/enums";

export const dynamic = "force-dynamic";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    await obterSessaoObrigatoriaApi(["prestador", "consumidor"]);
    const { status } = await request.json();

    if (!status) {
      throw new ErroAplicacao("Status é obrigatório.", 400);
    }

    const contratacao = await contratacaoServico.atualizarStatus(params.id, status as StatusContratacao);
    return responderSucesso(contratacao, `Status da contratação atualizado para ${status} com sucesso.`);
  } catch (erro) {
    return responderErro(erro);
  }
}
