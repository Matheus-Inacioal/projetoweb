import { obterSessaoObrigatoriaApi } from "@/lib/autenticacao/sessao";
import { prestadorServico } from "@/services/prestador-servico";
import { criarClienteSupabaseServidor } from "@/lib/banco/supabase-server";
import { responderErro, responderSucesso } from "@/lib/utilitarios/respostas-api";
import { ErroAplicacao } from "@/lib/utilitarios/erro-aplicacao";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const sessao = await obterSessaoObrigatoriaApi(["gestor_loja", "admin"]);
    const supabase = criarClienteSupabaseServidor();

    let lojaId = "";
    if (sessao.tipoUsuario === "gestor_loja") {
      const { data: gestor } = await supabase
        .from("gestores")
        .select("loja_id")
        .eq("usuario_id", sessao.usuarioId)
        .single();
      if (!gestor) throw new ErroAplicacao("Gestor não associado a uma loja.", 403);
      lojaId = gestor.loja_id;
    } else {
      const { searchParams } = new URL(request.url);
      lojaId = searchParams.get("lojaId") || "";
    }

    const prestadores = await prestadorServico.listarPrestadores({ lojaId });
    return responderSucesso(prestadores, "Barbeiros carregados com sucesso.");
  } catch (erro) {
    return responderErro(erro);
  }
}

export async function POST(request: Request) {
  try {
    const sessao = await obterSessaoObrigatoriaApi(["gestor_loja", "admin"]);
    const supabase = criarClienteSupabaseServidor();

    let lojaId = "";
    if (sessao.tipoUsuario === "gestor_loja") {
      const { data: gestor } = await supabase
        .from("gestores")
        .select("loja_id")
        .eq("usuario_id", sessao.usuarioId)
        .single();
      if (!gestor) throw new ErroAplicacao("Gestor não associado a uma loja.", 403);
      lojaId = gestor.loja_id;
    } else {
      const { lojaId: bodyLojaId } = await request.clone().json();
      lojaId = bodyLojaId || "00000000-0000-0000-0000-000000000000";
    }

    const { nome, email, telefone, especialidade, descricao, fotoUrl } = await request.json();

    if (!nome || !email || !especialidade) {
      throw new ErroAplicacao("Nome, e-mail e especialidade são obrigatórios.", 400);
    }

    const resultado = await prestadorServico.criarPrestador(lojaId, {
      nome,
      email,
      telefone: telefone || "",
      especialidade,
      descricao: descricao || "",
      fotoUrl
    });

    return responderSucesso(resultado, "Barbeiro cadastrado com sucesso! Compartilhe as credenciais geradas.", 201);
  } catch (erro) {
    return responderErro(erro);
  }
}
