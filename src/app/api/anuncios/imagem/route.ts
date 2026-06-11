import { obterSessaoObrigatoriaApi } from "@/lib/autenticacao/sessao";
import { anuncioServico } from "@/services/anuncio-servico";
import { prestadorServico } from "@/services/prestador-servico";
import { responderErro, responderSucesso } from "@/lib/utilitarios/respostas-api";
import { ErroAplicacao } from "@/lib/utilitarios/erro-aplicacao";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const sessao = await obterSessaoObrigatoriaApi(["prestador"]);
    const prestador = await prestadorServico.obterPrestadorPorUsuarioId(sessao.usuarioId);

    const formData = await request.formData();
    const arquivo = formData.get("imagem") as File | null;

    if (!arquivo) {
      throw new ErroAplicacao("Nenhuma imagem enviada.", 400);
    }

    const buffer = Buffer.from(await arquivo.arrayBuffer());
    const publicUrl = await anuncioServico.fazerUploadImagem(
      prestador.id,
      buffer,
      arquivo.name,
      arquivo.type
    );

    return responderSucesso({ imagemUrl: publicUrl }, "Imagem do anúncio enviada com sucesso.");
  } catch (erro) {
    return responderErro(erro);
  }
}
