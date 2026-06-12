import { obterSessaoObrigatoriaApi } from "@/lib/autenticacao/sessao";
import { usuarioServico } from "@/services/usuario-servico";
import { responderErro, responderSucesso } from "@/lib/utilitarios/respostas-api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const sessao = await obterSessaoObrigatoriaApi();
    const perfil = await usuarioServico.obterPerfil(sessao.usuarioId);
    return responderSucesso(perfil, "Perfil carregado com sucesso.");
  } catch (erro) {
    return responderErro(erro);
  }
}

export async function PUT(request: Request) {
  try {
    const sessao = await obterSessaoObrigatoriaApi();
    const corpo = await request.json();

    const perfilAtualizado = await usuarioServico.atualizarPerfil(sessao.usuarioId, {
      nome: corpo.nome,
      telefone: corpo.telefone
    });

    if (sessao.tipoUsuario === "prestador") {
      await usuarioServico.atualizarDadosPrestador(sessao.usuarioId, {
        descricao: corpo.descricao ?? "",
        especialidade: corpo.especialidade ?? "",
        endereco: corpo.endereco ?? "",
        cidade: corpo.cidade ?? "",
        ativo: corpo.ativo
      });
    }

    const perfilCompleto = await usuarioServico.obterPerfil(sessao.usuarioId);
    return responderSucesso(perfilCompleto, "Perfil atualizado com sucesso.");
  } catch (erro) {
    return responderErro(erro);
  }
}
