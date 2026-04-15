import { obterSessaoObrigatoriaApi } from "@/lib/autenticacao/sessao";
import { barbeiroServico } from "@/lib/servicos/barbeiro-servico";
import { disponibilidadeServico } from "@/lib/servicos/disponibilidade-servico";
import { ErroAplicacao } from "@/lib/utilitarios/erro-aplicacao";
import { responderErro, responderSucesso } from "@/lib/utilitarios/respostas-api";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: { barbeiroId: string } }) {
  try {
    const listaDisponibilidades = await disponibilidadeServico.listarDisponibilidadesPorBarbeiro(params.barbeiroId);
    return responderSucesso(listaDisponibilidades, "Disponibilidades carregadas com sucesso.");
  } catch (erro) {
    return responderErro(erro);
  }
}

export async function POST(request: Request, { params }: { params: { barbeiroId: string } }) {
  try {
    const sessao = obterSessaoObrigatoriaApi(["PRESTADOR_PF", "ADMIN"]);

    if (sessao.perfil === "PRESTADOR_PF") {
      const perfilProfissional = await barbeiroServico.obterBarbeiroPorUsuarioId(sessao.usuarioId);

      if (!perfilProfissional || perfilProfissional.barbeiro.id !== params.barbeiroId) {
        throw new ErroAplicacao("Voce nao pode alterar a disponibilidade deste barbeiro.", 403);
      }
    }

    const corpoRequisicao = await request.json();
    const disponibilidade = await disponibilidadeServico.criarDisponibilidade(params.barbeiroId, corpoRequisicao);
    return responderSucesso(disponibilidade, "Disponibilidade cadastrada com sucesso.", 201);
  } catch (erro) {
    return responderErro(erro);
  }
}
