export function MensagemRetorno({
  tipo,
  mensagem
}: {
  tipo: "sucesso" | "erro";
  mensagem: string;
}) {
  const classes =
    tipo === "sucesso"
      ? "border-sucesso/20 bg-sucesso/5 text-sucesso"
      : "border-perigo/20 bg-perigo/5 text-perigo";

  return <div className={`rounded-xl border px-4 py-3 text-sm font-medium ${classes}`}>{mensagem}</div>;
}
