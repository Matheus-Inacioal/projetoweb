import Link from "next/link";
import type { SessaoUsuario } from "@/tipos/dados";
import { rotulosPerfil } from "@/tipos/enums";
import { BotaoLogout } from "@/componentes/layouts/BotaoLogout";

function montarLinks(sessao: SessaoUsuario | null) {
  if (!sessao) {
    return [
      { href: "/", label: "Início" },
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
      { href: "/barbearia/servicos", label: "Serviços" }
    ];
  }

  return [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/usuarios", label: "Usuários" },
    { href: "/admin/agendamentos", label: "Agendamentos" }
  ];
}

export function CabecalhoAplicacao({ sessao }: { sessao: SessaoUsuario | null }) {
  const links = montarLinks(sessao);

  return (
    <header className="border-b border-bege_borda bg-gradient-to-r from-off_white to-marfim backdrop-blur">
      <div className="container-pagina flex flex-col gap-4 py-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <Link className="font-serif text-3xl font-bold tracking-tight text-verde_petroleo" href="/">
            BarberGo
          </Link>
          <p className="mt-1 text-sm text-texto_secundario">Marketplace de barbearias premium</p>
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <nav className="flex flex-wrap gap-2">
            {links.map((linkAtual) => (
              <Link
                key={linkAtual.href}
                className="rounded-lg border border-bege_borda bg-off_white px-4 py-2 text-sm font-medium text-texto_principal transition hover:border-dourado hover:text-dourado hover:shadow-suave"
                href={linkAtual.href}
              >
                {linkAtual.label}
              </Link>
            ))}
          </nav>

          {sessao ? (
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <div className="rounded-lg border border-bege_borda bg-off_white px-4 py-3 text-sm text-texto_principal shadow-suave">
                <p className="font-semibold text-verde_petroleo">{sessao.nome}</p>
                <p className="text-xs text-texto_secundario">{rotulosPerfil[sessao.perfil]}</p>
              </div>
              <BotaoLogout />
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
