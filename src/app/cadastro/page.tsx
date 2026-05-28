import Link from "next/link";
import { FormularioCadastro } from "@/componentes/formularios/FormularioCadastro";

export default function CadastroPage() {
  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Cabeçalho */}
        <div className="text-center mb-8">
          <p className="texto-destaque mb-2">INÍCIO PREMIUM</p>
          <h1 className="titulo-secao mb-3">Crie sua conta exclusiva</h1>
          <p className="text-texto_secundario">
            Junte-se a nossa comunidade de barbearias e clientes selecionados.
          </p>
        </div>

        {/* Card do formulário */}
        <div className="cartao p-8 mb-6">
          <FormularioCadastro />
        </div>

        {/* Link para login */}
        <div className="text-center">
          <p className="text-texto_secundario mb-2">Já faz parte da comunidade?</p>
          <Link href="/login" className="font-semibold text-verde_petroleo hover:text-verde_escuro transition">
            Faça login aqui
          </Link>
        </div>

        {/* Tipos de conta */}
        <div className="mt-10 space-y-4 border-t border-bege_borda pt-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-texto_secundario text-center mb-4">
            Tipo de conta
          </p>
          
          <div className="rounded-lg bg-marfim p-4">
            <p className="font-semibold text-verde_petroleo mb-1">👤 Cliente</p>
            <p className="text-xs text-texto_secundario">Agende com seus barbeiros favoritos e acompanhe seu histórico.</p>
          </div>

          <div className="rounded-lg bg-marfim p-4">
            <p className="font-semibold text-verde_petroleo mb-1">💼 Profissional</p>
            <p className="text-xs text-texto_secundario">Configure sua disponibilidade e gerencie seus agendamentos.</p>
          </div>

          <div className="rounded-lg bg-marfim p-4">
            <p className="font-semibold text-verde_petroleo mb-1">🏢 Barbearia</p>
            <p className="text-xs text-texto_secundario">Cadastre sua barbearia e gerencie toda a operação.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

