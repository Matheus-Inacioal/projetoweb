"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  UserCheck,
  Scissors,
  ShoppingBag,
  Calendar,
  CalendarCheck,
  DollarSign,
  Megaphone,
  FileText,
  Settings,
  Store,
  Percent
} from "lucide-react";
import clsx from "clsx";

export function SidebarAdmin() {
  const pathname = usePathname();

  const links = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Lojas", href: "/admin/lojas", icon: Store },
    { name: "Gestores", href: "/admin/gestores", icon: UserCheck },
    { name: "Usuários", href: "/admin/usuarios", icon: Users },
    { name: "Prestadores", href: "/admin/prestadores", icon: Briefcase },
    { name: "Consumidores", href: "/admin/consumidores", icon: Users }, // let's use Users for Consumidores to free up UserCheck or just keep it simple
    { name: "Serviços", href: "/admin/servicos", icon: Scissors },
    { name: "Produtos", href: "/admin/produtos", icon: ShoppingBag },
    { name: "Agenda", href: "/admin/agenda", icon: Calendar },
    { name: "Contratações", href: "/admin/contratacoes", icon: CalendarCheck },
    { name: "Pagamentos", href: "/admin/pagamentos", icon: DollarSign },
    { name: "Comissões", href: "/admin/comissoes", icon: Percent },
    { name: "Anúncios", href: "/admin/anuncios", icon: Megaphone },
    { name: "Relatórios", href: "/admin/relatorios", icon: FileText },
    { name: "Configurações", href: "/admin/configuracoes", icon: Settings }
  ];

  return (
    <aside className="w-64 bg-verde_petroleo text-marfim border-r border-bege_borda/20 shrink-0 hidden md:block">
      <div className="p-6 border-b border-bege_borda/10">
        <h2 className="text-xl font-serif font-bold text-dourado tracking-wide uppercase">
          Painel Admin
        </h2>
        <p className="text-xs text-marfim/60 mt-1">Gestão BarberGo</p>
      </div>

      <nav className="p-4 space-y-1">
        {links.map((link) => {
          const Icone = link.icon;
          const ativo = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                ativo
                  ? "bg-dourado text-verde_petroleo font-semibold shadow-suave"
                  : "text-marfim/80 hover:bg-marfim/10 hover:text-marfim"
              )}
            >
              <Icone className="w-5 h-5" />
              <span>{link.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
