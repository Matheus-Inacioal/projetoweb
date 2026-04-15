import bcrypt from "bcryptjs";
import { usuarioRepositorio } from "@/lib/repositorios/usuario-repositorio";
import { ErroAplicacao, garantirCondicao } from "@/lib/utilitarios/erro-aplicacao";
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
    const usuarioExistente = await usuarioRepositorio.obterUsuarioPorEmail(emailNormalizado);

    garantirCondicao(!usuarioExistente, "Ja existe um usuario cadastrado com este e-mail.", 409);

    const senhaHash = await bcrypt.hash(dadosValidados.senha, 10);
    const usuarioCriado = await usuarioRepositorio.criarUsuario({
      nome: dadosValidados.nome.trim(),
      email: emailNormalizado,
      senhaHash,
      perfil: dadosValidados.perfil
    });

    return {
      usuario: mapearUsuarioResumo(usuarioCriado),
      sessao: criarDadosSessao(usuarioCriado)
    };
  },

  async autenticarUsuario(entrada: unknown) {
    const dadosValidados = esquemaLoginUsuario.parse(entrada);
    const emailNormalizado = dadosValidados.email.trim().toLowerCase();
    const usuario = await usuarioRepositorio.obterUsuarioPorEmail(emailNormalizado);

    if (!usuario) {
      throw new ErroAplicacao("Credenciais invalidas.", 401);
    }

    const senhaValida = await bcrypt.compare(dadosValidados.senha, usuario.senhaHash);

    if (!senhaValida) {
      throw new ErroAplicacao("Credenciais invalidas.", 401);
    }

    return {
      usuario: mapearUsuarioResumo(usuario),
      sessao: criarDadosSessao(usuario)
    };
  }
};
