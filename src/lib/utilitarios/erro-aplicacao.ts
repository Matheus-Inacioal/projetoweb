export class ErroAplicacao extends Error {
  public statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = "ErroAplicacao";
    this.statusCode = statusCode;
  }
}

export function garantirCondicao(condicao: boolean, mensagem: string, statusCode = 400) {
  if (!condicao) {
    throw new ErroAplicacao(mensagem, statusCode);
  }
}

export function garantirExistencia<TValor>(valor: TValor | null | undefined, mensagem: string, statusCode = 404) {
  if (valor === null || valor === undefined) {
    throw new ErroAplicacao(mensagem, statusCode);
  }

  return valor;
}
