import { obterSessaoObrigatoriaApi } from "@/lib/autenticacao/sessao";
import { prestadorServico } from "@/services/prestador-servico";
import { responderErro, responderSucesso } from "@/lib/utilitarios/respostas-api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const sessao = await obterSessaoObrigatoriaApi(["prestador"]);
    const prestador = await prestadorServico.obterPrestadorPorUsuarioId(sessao.usuarioId);
    return responderSucesso(prestador, "Perfil do prestador carregado com sucesso.");
  } catch (erro) {
    return responderErro(erro);
  }
}
