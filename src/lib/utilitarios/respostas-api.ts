import { ZodError } from "zod";
import { NextResponse } from "next/server";
import { ErroAplicacao } from "@/lib/utilitarios/erro-aplicacao";

export function responderSucesso<TDados>(dados: TDados, mensagem = "Operacao realizada com sucesso.", status = 200) {
  return NextResponse.json(
    {
      sucesso: true,
      mensagem,
      dados
    },
    { status }
  );
}

export function responderErro(erro: unknown) {
  if (erro instanceof ZodError) {
    return NextResponse.json(
      {
        sucesso: false,
        mensagem: erro.issues[0]?.message ?? "Dados invalidos.",
        dados: null
      },
      { status: 422 }
    );
  }

  if (erro instanceof ErroAplicacao) {
    return NextResponse.json(
      {
        sucesso: false,
        mensagem: erro.message,
        dados: null
      },
      { status: erro.statusCode }
    );
  }

  console.error("Erro nao tratado na API:", erro);

  return NextResponse.json(
    {
      sucesso: false,
      mensagem: "Ocorreu um erro interno inesperado.",
      dados: null
    },
    { status: 500 }
  );
}

