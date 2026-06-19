import { obterSessaoObrigatoriaApi } from "@/lib/autenticacao/sessao";
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

    const { data: servicos, error } = await supabase
      .from("servicos")
      .select("*")
      .eq("loja_id", lojaId)
      .order("nome");

    if (error) throw new ErroAplicacao(error.message, 400);

    return responderSucesso(servicos, "Serviços da loja carregados com sucesso.");
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

    const { nome, descricao, preco, duracaoMinutos } = await request.json();

    if (!nome || preco === undefined || duracaoMinutos === undefined) {
      throw new ErroAplicacao("Nome, preço e duração são obrigatórios.", 400);
    }

    const { data, error } = await supabase
      .from("servicos")
      .insert({
        loja_id: lojaId,
        nome,
        descricao: descricao || "",
        preco: Number(preco),
        duracao_minutos: Number(duracaoMinutos),
        ativo: true
      })
      .select()
      .single();

    if (error) throw new ErroAplicacao(error.message, 400);

    return responderSucesso(data, "Serviço cadastrado com sucesso.", 201);
  } catch (erro) {
    return responderErro(erro);
  }
}
