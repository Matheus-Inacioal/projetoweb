import { criarClienteSupabaseServidor } from "@/lib/banco/supabase-server";
import { ErroAplicacao } from "@/lib/utilitarios/erro-aplicacao";
import type { SessaoUsuario } from "@/tipos/dados";
import type { TipoUsuario } from "@/tipos/enums";

export async function obterSessaoAtual(): Promise<SessaoUsuario | null> {
  const supabase = criarClienteSupabaseServidor();

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  const { data: usuario } = await supabase
    .from("usuarios")
    .select("nome, tipo")
    .eq("id", user.id)
    .single();

  if (!usuario) {
    return null;
  }

  return {
    usuarioId: user.id,
    nome: usuario.nome,
    email: user.email ?? "",
    tipo: usuario.tipo as TipoUsuario
  };
}

export async function obterSessaoObrigatoriaApi(tiposPermitidos?: TipoUsuario[]): Promise<SessaoUsuario> {
  const sessao = await obterSessaoAtual();

  if (!sessao) {
    throw new ErroAplicacao("Usuário não autenticado.", 401);
  }

  if (tiposPermitidos && !tiposPermitidos.includes(sessao.tipo)) {
    throw new ErroAplicacao("Você não possui permissão para esta operação.", 403);
  }

  return sessao;
}
