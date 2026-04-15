import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { ErroAplicacao } from "@/lib/utilitarios/erro-aplicacao";
import type { SessaoUsuario } from "@/tipos/dados";
import type { PerfilUsuario } from "@/tipos/enums";

const NOME_COOKIE_SESSAO = "barbergo_sessao";

function obterChaveSessao() {
  return process.env.CHAVE_SESSAO || "barbergo-chave-local-super-segura";
}

function assinarTexto(texto: string) {
  return createHmac("sha256", obterChaveSessao()).update(texto).digest("hex");
}

function serializarSessao(sessao: SessaoUsuario) {
  const payload = Buffer.from(JSON.stringify(sessao)).toString("base64url");
  const assinatura = assinarTexto(payload);
  return `${payload}.${assinatura}`;
}

function desserializarSessao(valor: string): SessaoUsuario | null {
  const [payload, assinatura] = valor.split(".");

  if (!payload || !assinatura) {
    return null;
  }

  const assinaturaEsperada = assinarTexto(payload);
  const bufferAssinatura = Buffer.from(assinatura);
  const bufferEsperado = Buffer.from(assinaturaEsperada);

  if (bufferAssinatura.length !== bufferEsperado.length) {
    return null;
  }

  if (!timingSafeEqual(bufferAssinatura, bufferEsperado)) {
    return null;
  }

  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf-8")) as SessaoUsuario;
  } catch {
    return null;
  }
}

export function criarSessaoParaUsuario(dados: { usuarioId: string; nome: string; email: string; perfil: PerfilUsuario }) {
  const sessao = serializarSessao(dados);
  cookies().set(NOME_COOKIE_SESSAO, sessao, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8
  });
}

export function encerrarSessaoUsuario() {
  cookies().delete(NOME_COOKIE_SESSAO);
}

export function obterSessaoAtual() {
  const cookieSessao = cookies().get(NOME_COOKIE_SESSAO)?.value;

  if (!cookieSessao) {
    return null;
  }

  return desserializarSessao(cookieSessao);
}

export function obterSessaoObrigatoriaApi(perfisPermitidos?: PerfilUsuario[]) {
  const sessao = obterSessaoAtual();

  if (!sessao) {
    throw new ErroAplicacao("Usuario nao autenticado.", 401);
  }

  if (perfisPermitidos && !perfisPermitidos.includes(sessao.perfil)) {
    throw new ErroAplicacao("Voce nao possui permissao para esta operacao.", 403);
  }

  return sessao;
}
