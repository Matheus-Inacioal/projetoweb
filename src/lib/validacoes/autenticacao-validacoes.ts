import { z } from "zod";
import { PERFIS_CADASTRAVEIS } from "@/tipos/enums";

export const esquemaCadastroUsuario = z.object({
  nome: z.string().min(3, "Informe um nome com pelo menos 3 caracteres."),
  email: z.string().email("Informe um e-mail valido."),
  senha: z.string().min(6, "A senha precisa ter pelo menos 6 caracteres."),
  perfil: z.enum(PERFIS_CADASTRAVEIS, {
    message: "Selecione um perfil valido."
  })
});

export const esquemaLoginUsuario = z.object({
  email: z.string().email("Informe um e-mail valido."),
  senha: z.string().min(6, "Informe a senha cadastrada.")
});

export type EntradaCadastroUsuario = z.infer<typeof esquemaCadastroUsuario>;
export type EntradaLoginUsuario = z.infer<typeof esquemaLoginUsuario>;

