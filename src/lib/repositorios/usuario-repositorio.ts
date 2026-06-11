import { criarClienteSupabaseServidor } from "@/lib/banco/supabase-server";
import type { PerfilDB } from "@/lib/utilitarios/mapeadores";
import type { PerfilUsuario } from "@/tipos/enums";

export const usuarioRepositorio = {
  async obterUsuarioPorEmail(email: string) {
    const supabase = criarClienteSupabaseServidor();
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", email)
      .single();
    return data as PerfilDB | null;
  },

  async obterUsuarioPorId(id: string) {
    const supabase = criarClienteSupabaseServidor();
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single();
    return data as PerfilDB | null;
  },

  async listarUsuarios() {
    const supabase = criarClienteSupabaseServidor();
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("criado_em", { ascending: false });
    return (data ?? []) as PerfilDB[];
  },

  async atualizarUsuario(id: string, dados: Partial<Pick<PerfilDB, "nome" | "email">>) {
    const supabase = criarClienteSupabaseServidor();
    const { data } = await supabase
      .from("profiles")
      .update(dados)
      .eq("id", id)
      .select("*")
      .single();
    return data as PerfilDB;
  },

  async contarUsuarios() {
    const supabase = criarClienteSupabaseServidor();
    const { count } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });
    return count ?? 0;
  },

  async listarUsuariosPorPerfil(perfil: PerfilUsuario) {
    const supabase = criarClienteSupabaseServidor();
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("perfil", perfil)
      .order("nome", { ascending: true });
    return (data ?? []) as PerfilDB[];
  }
};
