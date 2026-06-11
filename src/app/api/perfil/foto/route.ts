import { obterSessaoObrigatoriaApi } from "@/lib/autenticacao/sessao";
import { usuarioServico } from "@/services/usuario-servico";
import { responderErro, responderSucesso } from "@/lib/utilitarios/respostas-api";
import { ErroAplicacao } from "@/lib/utilitarios/erro-aplicacao";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const sessao = await obterSessaoObrigatoriaApi();
    const formData = await request.formData();
    const arquivo = formData.get("foto") as File | null;

    if (!arquivo) {
      throw new ErroAplicacao("Nenhum arquivo enviado.", 400);
    }

    const buffer = Buffer.from(await arquivo.arrayBuffer());
    const publicUrl = await usuarioServico.fazerUploadFoto(
      sessao.usuarioId,
      buffer,
      arquivo.name,
      arquivo.type
    );

    return responderSucesso({ fotoUrl: publicUrl }, "Foto atualizada com sucesso.");
  } catch (erro) {
    return responderErro(erro);
  }
}
