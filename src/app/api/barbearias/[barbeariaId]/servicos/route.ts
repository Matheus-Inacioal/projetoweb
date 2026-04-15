import { obterSessaoObrigatoriaApi } from "@/lib/autenticacao/sessao";
import { barbeariaServico } from "@/lib/servicos/barbearia-servico";
import { servicoServico } from "@/lib/servicos/servico-servico";
import { ErroAplicacao } from "@/lib/utilitarios/erro-aplicacao";
import { responderErro, responderSucesso } from "@/lib/utilitarios/respostas-api";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: { barbeariaId: string } }) {
  try {
    const listaServicos = await servicoServico.listarServicosPorBarbearia(params.barbeariaId);
    return responderSucesso(listaServicos, "Servicos carregados com sucesso.");
  } catch (erro) {
    return responderErro(erro);
  }
}

export async function POST(request: Request, { params }: { params: { barbeariaId: string } }) {
  try {
    const sessao = obterSessaoObrigatoriaApi(["PRESTADOR_PJ", "ADMIN"]);

    if (sessao.perfil === "PRESTADOR_PJ") {
      const perfilBarbearia = await barbeariaServico.obterPerfilBarbearia(sessao.usuarioId);

      if (!perfilBarbearia.barbearia || perfilBarbearia.barbearia.id !== params.barbeariaId) {
        throw new ErroAplicacao("Voce nao pode cadastrar servicos para esta barbearia.", 403);
      }
    }

    const corpoRequisicao = await request.json();
    const resultadoCriacao = await servicoServico.criarServicoParaBarbearia(params.barbeariaId, corpoRequisicao);

    return responderSucesso(resultadoCriacao, "Servico cadastrado com sucesso.", 201);
  } catch (erro) {
    return responderErro(erro);
  }
}
