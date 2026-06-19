import { obterSessaoObrigatoriaApi } from "@/lib/autenticacao/sessao";
import { prestadorServico } from "@/services/prestador-servico";
import { responderErro, responderSucesso } from "@/lib/utilitarios/respostas-api";

export const dynamic = "force-dynamic";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await obterSessaoObrigatoriaApi(["gestor_loja", "admin"]);

    const { nome, telefone, especialidade, descricao, fotoUrl, ativo } = await request.json();

    const atualizado = await prestadorServico.atualizarPrestador(params.id, {
      nome,
      telefone,
      especialidade,
      descricao,
      fotoUrl,
      ativo
    });

    return responderSucesso(atualizado, "Dados do barbeiro atualizados com sucesso.");
  } catch (erro) {
    return responderErro(erro);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await obterSessaoObrigatoriaApi(["gestor_loja", "admin"]);

    await prestadorServico.excluirPrestador(params.id);

    return responderSucesso(null, "Barbeiro removido com sucesso.");
  } catch (erro) {
    return responderErro(erro);
  }
}
