import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/banco/prisma";
import type { PerfilUsuario } from "@/tipos/enums";

export const usuarioRepositorio = {
  criarUsuario(dados: Prisma.UsuarioCreateInput) {
    return prisma.usuario.create({ data: dados });
  },

  obterUsuarioPorEmail(email: string) {
    return prisma.usuario.findUnique({ where: { email } });
  },

  obterUsuarioPorId(id: string) {
    return prisma.usuario.findUnique({ where: { id } });
  },

  listarUsuarios() {
    return prisma.usuario.findMany({
      orderBy: {
        criadoEm: "desc"
      }
    });
  },

  atualizarUsuario(id: string, dados: Prisma.UsuarioUpdateInput) {
    return prisma.usuario.update({
      where: { id },
      data: dados
    });
  },

  contarUsuarios() {
    return prisma.usuario.count();
  },

  listarUsuariosPorPerfil(perfil: PerfilUsuario) {
    return prisma.usuario.findMany({
      where: { perfil },
      orderBy: {
        nome: "asc"
      }
    });
  }
};
