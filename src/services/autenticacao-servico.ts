import { criarClienteSupabaseServidor } from "@/lib/banco/supabase-server";
import { ErroAplicacao } from "@/lib/utilitarios/erro-aplicacao";
import type { TipoUsuario } from "@/tipos/enums";

export const autenticacaoServico = {
  async cadastrar(email: string, aSenha: string, nome: string, telefone: string, tipo: TipoUsuario) {
    const supabase = criarClienteSupabaseServidor();

    // 1. Cadastra no Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password: aSenha,
      options: {
        data: {
          nome,
          telefone,
          tipo
        }
      }
    });

    if (error) {
      throw new ErroAplicacao(error.message, 400);
    }

    if (!data.user) {
      throw new ErroAplicacao("Não foi possível criar a conta.", 400);
    }

    const userId = data.user.id;

    // 2. Cria o registro complementar dependendo do tipo de usuário
    if (tipo === "prestador") {
      const { error: prestadorError } = await supabase
        .from("prestadores")
        .insert({
          usuario_id: userId,
          descricao: "",
          especialidade: "",
          endereco: "",
          cidade: ""
        });
      if (prestadorError) {
        console.error("Erro ao criar perfil de prestador:", prestadorError);
      }
    } else if (tipo === "consumidor") {
      const { error: consumidorError } = await supabase
        .from("consumidores")
        .insert({
          usuario_id: userId
        });
      if (consumidorError) {
        console.error("Erro ao criar perfil de consumidor:", consumidorError);
      }
    }

    return {
      usuarioId: userId,
      email: data.user.email,
      tipo
    };
  },

  async login(email: string, aSenha: string) {
    const supabase = criarClienteSupabaseServidor();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: aSenha
    });

    if (error) {
      throw new ErroAplicacao("Credenciais inválidas.", 400);
    }

    if (!data.user) {
      throw new ErroAplicacao("Usuário não encontrado.", 400);
    }

    // Busca o tipo do usuário
    const { data: usuario, error: usuarioError } = await supabase
      .from("usuarios")
      .select("tipo, nome")
      .eq("id", data.user.id)
      .single();

    if (usuarioError || !usuario) {
      throw new ErroAplicacao("Perfil de usuário não encontrado no banco de dados.", 400);
    }

    return {
      usuarioId: data.user.id,
      nome: usuario.nome,
      email: data.user.email ?? "",
      tipo: usuario.tipo as TipoUsuario
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
