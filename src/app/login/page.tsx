import Link from "next/link";
import { FormularioLogin } from "@/componentes/formularios/FormularioLogin";

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Cabeçalho */}
        <div className="text-center mb-8">
          <p className="texto-destaque mb-2">ACESSO EXCLUSIVO</p>
          <h1 className="titulo-secao mb-3">Bem-vindo de volta</h1>
          <p className="text-texto_secundario">
            Entre para acessar sua conta e continue sua experiência premium.
          </p>
        </div>

        {/* Card do formulário */}
        <div className="cartao p-8 mb-6">
          <FormularioLogin />
        </div>

        {/* Link para cadastro */}
        <div className="text-center">
          <p className="text-texto_secundario mb-2">Não tem uma conta?</p>
          <Link href="/cadastro" className="font-semibold text-verde_petroleo hover:text-verde_escuro transition">
            Criar cadastro agora
          </Link>
        </div>

        {/* Benefícios */}
        <div className="mt-10 space-y-3 border-t border-bege_borda pt-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-texto_secundario text-center mb-4">
            Vantagens de fazer parte
          </p>
          <div className="flex items-center gap-3 text-sm text-texto_secundario">
            <span className="text-dourado font-bold">✓</span>
            <span>Agendamentos exclusivos com barbeiros selecionados</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-texto_secundario">
            <span className="text-dourado font-bold">✓</span>
            <span>Histórico completo de atendimentos e avaliações</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-texto_secundario">
            <span className="text-dourado font-bold">✓</span>
            <span>Horários reservados para clientes premium</span>
          </div>
        </div>
      </div>
    </div>
  );
}

