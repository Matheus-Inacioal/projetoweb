import type { InputHTMLAttributes } from "react";

interface PropriedadesCampoTexto extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function CampoTexto({ label, id, ...props }: PropriedadesCampoTexto) {
  return (
    <label className="space-y-2">
      <span className="block text-sm font-medium text-slate-700">{label}</span>
      <input className="campo-base" id={id} {...props} />
    </label>
  );
}

