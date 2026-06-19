import { criarClienteSupabaseServidor } from "@/lib/banco/supabase-server";
import { ErroAplicacao } from "@/lib/utilitarios/erro-aplicacao";
import type { TipoUsuario } from "@/tipos/enums";

export const autenticacaoServico = {
  async cadastrar(email: string, aSenha: string, nome: string, telefone: string, tipo: TipoUsuario, metadataExtra?: Record<string, any>) {
    const supabase = criarClienteSupabaseServidor();

    // 1. Cadastra no Supabase Auth com tipo_usuario na metadata para o trigger handle_new_user()
    const { data, error } = await supabase.auth.signUp({
      email,
      password: aSenha,
      options: {
        data: {
          nome,
          telefone,
          tipo_usuario: tipo,
          ...metadataExtra
        }
      }
    });

    if (error) {
      throw new ErroAplicacao(error.message, 400);
    }

    if (!data.user) {
      throw new ErroAplicacao("Não foi possível criar a conta.", 400);
    }

    return {
      usuarioId: data.user.id,
      email: data.user.email,
      tipoUsuario: tipo
    };
  },

  async login(email: string, aSenha: string) {
    const supabase = criarClienteSupabaseServidor();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: aSenha
    });

    if (error) {
      console.error("Erro no Supabase Auth (signInWithPassword):", error.message, error.status);
      throw new ErroAplicacao(error.message === "Invalid login credentials" ? "Credenciais inválidas." : error.message, 400);
    }

    if (!data.user) {
      throw new ErroAplicacao("Usuário não encontrado.", 400);
    }

    // Busca o tipo do usuário
    const { data: usuario, error: usuarioError } = await supabase
      .from("usuarios")
      .select("tipo_usuario, nome")
      .eq("id", data.user.id)
      .single();

    if (usuarioError || !usuario) {
      throw new ErroAplicacao("Perfil de usuário não encontrado no banco de dados.", 400);
    }

    return {
      usuarioId: data.user.id,
      nome: usuario.nome,
      email: data.user.email ?? "",
      tipoUsuario: usuario.tipo_usuario as TipoUsuario
    };
  },

  async logout() {
    const supabase = criarClienteSupabaseServidor();
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new ErroAplicacao(error.message, 400);
    }
  }
};
