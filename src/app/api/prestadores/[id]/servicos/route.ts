import { obterSessaoObrigatoriaApi } from "@/lib/autenticacao/sessao";
import { prestadorServico } from "@/services/prestador-servico";
import { responderErro, responderSucesso } from "@/lib/utilitarios/respostas-api";
import { ErroAplicacao } from "@/lib/utilitarios/erro-aplicacao";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const servicos = await prestadorServico.listarServicos(params.id);
    return responderSucesso(servicos, "Serviços carregados com sucesso.");
  } catch (erro) {
    return responderErro(erro);
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const sessao = await obterSessaoObrigatoriaApi(["prestador"]);
    const prestadorLogado = await prestadorServico.obterPrestadorPorUsuarioId(sessao.usuarioId);

    if (prestadorLogado.id !== params.id) {
      throw new ErroAplicacao("Acesso não autorizado a este prestador.", 403);
    }

    const corpo = await request.json();
    const servico = await prestadorServico.criarServico(params.id, {
      nome: corpo.nome,
      descricao: corpo.descricao || "",
      preco: Number(corpo.preco),
      duracaoMinutos: Number(corpo.duracaoMinutos || 30)
    });

    return responderSucesso(servico, "Serviço adicionado com sucesso.", 201);
  } catch (erro) {
    return responderErro(erro);
  }
}
