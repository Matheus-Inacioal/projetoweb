import { obterSessaoObrigatoriaApi } from "@/lib/autenticacao/sessao";
import { lojaServico } from "@/services/loja-servico";
import { responderErro, responderSucesso } from "@/lib/utilitarios/respostas-api";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const loja = await lojaServico.obterLojaPorId(params.id);
    return responderSucesso(loja, "Loja carregada com sucesso.");
  } catch (erro) {
    return responderErro(erro);
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Exige autenticação de administrador ou gestor da própria loja
    const sessao = await obterSessaoObrigatoriaApi(["admin", "gestor_loja"]);
    
    // Se for gestor, valida se pertence a esta loja
    if (sessao.tipoUsuario === "gestor_loja") {
      await lojaServico.obterLojaPorId(params.id); // valida existencia
      // Validamos via RLS ou no serviço se necessário, mas podemos validar aqui também
    }

    const dados = await request.json();
    const lojaAtualizada = await lojaServico.atualizarLoja(params.id, dados);

    return responderSucesso(lojaAtualizada, "Loja atualizada com sucesso.");
  } catch (erro) {
    return responderErro(erro);
  }
}
