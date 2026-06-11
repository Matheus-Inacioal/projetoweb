import { obterSessaoObrigatoriaApi } from "@/lib/autenticacao/sessao";
import { prestadorServico } from "@/services/prestador-servico";
import { responderErro, responderSucesso } from "@/lib/utilitarios/respostas-api";
import { ErroAplicacao } from "@/lib/utilitarios/erro-aplicacao";

export const dynamic = "force-dynamic";

export async function PUT(request: Request, { params }: { params: { id: string; servicoId: string } }) {
  try {
    const sessao = await obterSessaoObrigatoriaApi(["prestador"]);
    const prestadorLogado = await prestadorServico.obterPrestadorPorUsuarioId(sessao.usuarioId);

    if (prestadorLogado.id !== params.id) {
      throw new ErroAplicacao("Acesso não autorizado.", 403);
    }

    const corpo = await request.json();
    const servico = await prestadorServico.atualizarServico(params.servicoId, params.id, {
      nome: corpo.nome,
      descricao: corpo.descricao || "",
      preco: Number(corpo.preco),
      duracaoMinutos: Number(corpo.duracaoMinutos || 30),
      ativo: corpo.ativo
    });

    return responderSucesso(servico, "Serviço atualizado com sucesso.");
  } catch (erro) {
    return responderErro(erro);
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string; servicoId: string } }) {
  try {
    const sessao = await obterSessaoObrigatoriaApi(["prestador"]);
    const prestadorLogado = await prestadorServico.obterPrestadorPorUsuarioId(sessao.usuarioId);

    if (prestadorLogado.id !== params.id) {
      throw new ErroAplicacao("Acesso não autorizado.", 403);
    }

    await prestadorServico.excluirServico(params.servicoId, params.id);
    return responderSucesso(null, "Serviço excluído com sucesso.");
  } catch (erro) {
    return responderErro(erro);
  }
}
