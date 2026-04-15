import { z } from "zod";

export const esquemaAtualizacaoUsuario = z.object({
  nome: z.string().min(3, "Informe um nome valido."),
  email: z.string().email("Informe um e-mail valido.")
});

export type EntradaAtualizacaoUsuario = z.infer<typeof esquemaAtualizacaoUsuario>;

