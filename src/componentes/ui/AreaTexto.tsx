import type { TextareaHTMLAttributes } from "react";

interface PropriedadesAreaTexto extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
}

export function AreaTexto({ label, id, ...props }: PropriedadesAreaTexto) {
  return (
    <label className="space-y-2">
      <span className="block text-sm font-medium text-slate-700">{label}</span>
      <textarea className="campo-base min-h-28 resize-y" id={id} {...props} />
    </label>
  );
}

