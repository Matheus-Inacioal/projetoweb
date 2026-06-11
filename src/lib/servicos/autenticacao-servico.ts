import { criarClienteSupabaseServidor } from "@/lib/banco/supabase-server";
import { usuarioRepositorio } from "@/lib/repositorios/usuario-repositorio";
import { ErroAplicacao } from "@/lib/utilitarios/erro-aplicacao";
import { mapearUsuarioResumo } from "@/lib/utilitarios/mapeadores";
import { esquemaCadastroUsuario, esquemaLoginUsuario } from "@/lib/validacoes/autenticacao-validacoes";
import type { SessaoUsuario } from "@/tipos/dados";
import type { PerfilUsuario } from "@/tipos/enums";

function criarDadosSessao(usuario: { id: string; nome: string; email: string; perfil: string }): SessaoUsuario {
  return {
    usuarioId: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    perfil: usuario.perfil as PerfilUsuario
  };
}

export const autenticacaoServico = {
  async cadastrarUsuario(entrada: unknown) {
    const dadosValidados = esquemaCadastroUsuario.parse(entrada);
    const emailNormalizado = dadosValidados.email.trim().toLowerCase();

    // Verificar se já existe um perfil com este email
    const usuarioExistente = await usuarioRepositorio.obterUsuarioPorEmail(emailNormalizado);

    if (usuarioExistente) {
      throw new ErroAplicacao("Ja existe um usuario cadastrado com este e-mail.", 409);
    }

    // Criar usuário via Supabase Auth
    const supabase = criarClienteSupabaseServidor();
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: emailNormalizado,
      password: dadosValidados.senha,
      options: {
        data: {
          nome: dadosValidados.nome.trim(),
          perfil: dadosValidados.perfil
        }
      }
    });

    if (authError || !authData.user) {
      throw new ErroAplicacao(authError?.message ?? "Erro ao criar usuario.", 400);
    }

    // O trigger handle_new_user() cria o profile automaticamente.
    // Aguardar um instante e buscar o perfil criado.
    const perfil = await usuarioRepositorio.obterUsuarioPorId(authData.user.id);

    if (!perfil) {
      throw new ErroAplicacao("Erro ao criar perfil do usuario.", 500);
    }

    return {
      usuario: mapearUsuarioResumo(perfil),
      sessao: criarDadosSessao({
        id: perfil.id,
        nome: perfil.nome,
        email: perfil.email,
        perfil: perfil.perfil
      })
    };
  },

  async autenticarUsuario(entrada: unknown) {
    const dadosValidados = esquemaLoginUsuario.parse(entrada);
    const emailNormalizado = dadosValidados.email.trim().toLowerCase();

    const supabase = criarClienteSupabaseServidor();
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: emailNormalizado,
      password: dadosValidados.senha
    });

    if (authError || !authData.user) {
      throw new ErroAplicacao("Credenciais invalidas.", 401);
    }

    const perfil = await usuarioRepositorio.obterUsuarioPorId(authData.user.id);

    if (!perfil) {
      throw new ErroAplicacao("Perfil do usuario nao encontrado.", 404);
    }

    return {
      usuario: mapearUsuarioResumo(perfil),
      sessao: criarDadosSessao({
        id: perfil.id,
        nome: perfil.nome,
        email: perfil.email,
        perfil: perfil.perfil
      })
    };
  }
};
