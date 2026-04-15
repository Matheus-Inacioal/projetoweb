import Link from "next/link";
import { FormularioLogin } from "@/componentes/formularios/FormularioLogin";
import { CabecalhoPagina } from "@/componentes/ui/CabecalhoPagina";

export default function LoginPage() {
  return (
    <div className="container-pagina grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <section className="space-y-6">
        <CabecalhoPagina
          descricao="Entre com uma conta existente para acessar o painel correspondente ao seu perfil."
          subtitulo="Autenticacao"
          titulo="Login no BarberGo"
        />
        <FormularioLogin />
      </section>

      <aside className="cartao space-y-5 p-6">
        <h2 className="text-xl font-semibold text-slate-900">Credenciais seed</h2>
        <div className="space-y-2 text-sm text-slate-600">
          <p>Senha padrao: <strong>123456</strong></p>
          <p>Admin: admin@barbergo.com</p>
          <p>Contratante: carlos@barbergo.com</p>
          <p>Prestador PF: rafael@barbergo.com</p>
          <p>Prestador PJ: contato@barbergocentro.com</p>
        </div>
        <p className="text-sm text-slate-600">
          Ainda nao tem conta? <Link className="font-semibold text-destaque" href="/cadastro">Criar cadastro</Link>
        </p>
      </aside>
    </div>
  );
}

