import type { SelectHTMLAttributes } from "react";

interface OpcaoCampo {
  valor: string;
  label: string;
}

interface PropriedadesCampoSelecao extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  opcoes: OpcaoCampo[];
}

export function CampoSelecao({ label, id, opcoes, ...props }: PropriedadesCampoSelecao) {
  return (
    <label className="space-y-2">
      <span className="block text-sm font-medium text-slate-700">{label}</span>
      <select className="campo-base" id={id} {...props}>
        {opcoes.map((opcao) => (
          <option key={opcao.valor} value={opcao.valor}>
            {opcao.label}
          </option>
        ))}
      </select>
    </label>
  );
}

