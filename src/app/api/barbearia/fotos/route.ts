import { obterSessaoObrigatoriaApi } from "@/lib/autenticacao/sessao";
import { barbeariaServico } from "@/lib/servicos/barbearia-servico";
import { fotoServico } from "@/lib/servicos/foto-servico";
import { ErroAplicacao } from "@/lib/utilitarios/erro-aplicacao";
import { responderErro, responderSucesso } from "@/lib/utilitarios/respostas-api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const sessao = await obterSessaoObrigatoriaApi(["PRESTADOR_PJ"]);
    const perfilBarbearia = await barbeariaServico.obterPerfilBarbearia(sessao.usuarioId);

    if (!perfilBarbearia.barbearia) {
      return responderSucesso([], "Nenhuma barbearia encontrada.");
    }

    const fotos = await fotoServico.listarFotosPorBarbearia(perfilBarbearia.barbearia.id);
    return responderSucesso(fotos, "Fotos carregadas com sucesso.");
  } catch (erro) {
    return responderErro(erro);
  }
}

export async function POST(request: Request) {
  try {
    const sessao = await obterSessaoObrigatoriaApi(["PRESTADOR_PJ"]);
    const perfilBarbearia = await barbeariaServico.obterPerfilBarbearia(sessao.usuarioId);

    if (!perfilBarbearia.barbearia) {
      throw new ErroAplicacao("Voce precisa cadastrar uma barbearia primeiro.", 400);
    }

    const formData = await request.formData();
    const arquivo = formData.get("arquivo") as File | null;
    const descricao = formData.get("descricao") as string | null;

    if (!arquivo) {
      throw new ErroAplicacao("Selecione um arquivo para upload.", 400);
    }

    const foto = await fotoServico.uploadFoto(
      perfilBarbearia.barbearia.id,
      arquivo,
      descricao ?? undefined
    );

    return responderSucesso(foto, "Foto enviada com sucesso.", 201);
  } catch (erro) {
    return responderErro(erro);
  }
}
