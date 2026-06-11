import { criarClienteSupabaseServidor } from "@/lib/banco/supabase-server";
import { ErroAplicacao } from "@/lib/utilitarios/erro-aplicacao";
import type { SessaoUsuario } from "@/tipos/dados";
import type { PerfilUsuario } from "@/tipos/enums";

export async function obterSessaoAtual(): Promise<SessaoUsuario | null> {
  const supabase = criarClienteSupabaseServidor();

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("nome, perfil")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return null;
  }

  return {
    usuarioId: user.id,
    nome: profile.nome,
    email: user.email ?? "",
    perfil: profile.perfil as PerfilUsuario
  };
}

export async function obterSessaoObrigatoriaApi(perfisPermitidos?: PerfilUsuario[]): Promise<SessaoUsuario> {
  const sessao = await obterSessaoAtual();

  if (!sessao) {
    throw new ErroAplicacao("Usuario nao autenticado.", 401);
  }

  if (perfisPermitidos && !perfisPermitidos.includes(sessao.perfil)) {
    throw new ErroAplicacao("Voce nao possui permissao para esta operacao.", 403);
  }

  return sessao;
}
