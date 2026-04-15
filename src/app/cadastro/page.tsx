import Link from "next/link";
import { FormularioCadastro } from "@/componentes/formularios/FormularioCadastro";
import { CabecalhoPagina } from "@/componentes/ui/CabecalhoPagina";

export default function CadastroPage() {
  return (
    <div className="container-pagina grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <section className="space-y-6">
        <CabecalhoPagina
          descricao="Cadastre uma conta e siga para a experiencia correspondente ao perfil escolhido."
          subtitulo="Novo acesso"
          titulo="Criar conta no BarberGo"
        />
        <FormularioCadastro />
      </section>

      <aside className="cartao space-y-5 p-6">
        <h2 className="text-xl font-semibold text-slate-900">Perfis disponiveis no MVP</h2>
        <div className="space-y-3 text-sm text-slate-600">
          <p><strong>Contratante:</strong> agenda servicos e acompanha historico.</p>
          <p><strong>Prestador PF:</strong> visualiza agenda do dia e configura disponibilidade.</p>
          <p><strong>Prestador PJ:</strong> gerencia a barbearia, barbeiros e servicos.</p>
        </div>
        <p className="text-sm text-slate-600">
          Ja possui uma conta? <Link className="font-semibold text-destaque" href="/login">Fazer login</Link>
        </p>
      </aside>
    </div>
  );
}

