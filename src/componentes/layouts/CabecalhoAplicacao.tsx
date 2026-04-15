import Link from "next/link";
import type { SessaoUsuario } from "@/tipos/dados";
import { rotulosPerfil } from "@/tipos/enums";
import { BotaoLogout } from "@/componentes/layouts/BotaoLogout";

function montarLinks(sessao: SessaoUsuario | null) {
  if (!sessao) {
    return [
      { href: "/", label: "Inicio" },
      { href: "/login", label: "Entrar" },
      { href: "/cadastro", label: "Criar conta" }
    ];
  }

  if (sessao.perfil === "CONTRATANTE") {
    return [
      { href: "/", label: "Barbearias" },
      { href: "/meus-agendamentos", label: "Meus agendamentos" },
      { href: "/perfil", label: "Perfil" }
    ];
  }

  if (sessao.perfil === "PRESTADOR_PF") {
    return [
      { href: "/profissional/dashboard", label: "Dashboard" },
      { href: "/profissional/agenda", label: "Agenda" },
      { href: "/profissional/disponibilidade", label: "Disponibilidade" }
    ];
  }

  if (sessao.perfil === "PRESTADOR_PJ") {
    return [
      { href: "/barbearia/dashboard", label: "Dashboard" },
      { href: "/barbearia/barbeiros", label: "Barbeiros" },
      { href: "/barbearia/servicos", label: "Servicos" }
    ];
  }

  return [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/usuarios", label: "Usuarios" },
    { href: "/admin/agendamentos", label: "Agendamentos" }
  ];
}

export function CabecalhoAplicacao({ sessao }: { sessao: SessaoUsuario | null }) {
  const links = montarLinks(sessao);

  return (
    <header className="border-b border-white/70 bg-white/80 backdrop-blur">
      <div className="container-pagina flex flex-col gap-4 py-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <Link className="text-2xl font-black tracking-tight text-primaria" href="/">
            BarberGo
          </Link>
          <p className="mt-1 text-sm text-slate-600">Marketplace academico de agendamento para barbearias.</p>
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <nav className="flex flex-wrap gap-2">
            {links.map((linkAtual) => (
              <Link
                key={linkAtual.href}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-destaque hover:text-destaque"
                href={linkAtual.href}
              >
                {linkAtual.label}
              </Link>
            ))}
          </nav>

          {sessao ? (
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                <p className="font-semibold text-slate-900">{sessao.nome}</p>
                <p>{rotulosPerfil[sessao.perfil]}</p>
              </div>
              <BotaoLogout />
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
