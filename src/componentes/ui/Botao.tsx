import { clsx } from "clsx";
import type { ButtonHTMLAttributes } from "react";

interface PropriedadesBotao extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: "primario" | "secundario" | "perigo";
  larguraTotal?: boolean;
}

export function Botao({
  children,
  className,
  variante = "primario",
  larguraTotal = false,
  ...props
}: PropriedadesBotao) {
  return (
    <button
      className={clsx(
        variante === "primario" && "botao-primario",
        variante === "secundario" && "botao-secundario",
        variante === "perigo" && "botao-perigo",
        larguraTotal && "w-full",
        props.disabled && "cursor-not-allowed opacity-70",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

