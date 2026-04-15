import type { ReactNode } from "react";
import Link from "next/link";

interface ItemMenuPainel {
  href: string;
  label: string;
}

export function LayoutPainel({
  titulo,
  descricao,
  itensMenu,
  children
}: {
  titulo: string;
  descricao: string;
  itensMenu: ItemMenuPainel[];
  children: ReactNode;
}) {
  return (
    <div className="container-pagina grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
      <aside className="cartao h-fit p-5">
        <div className="space-y-2 border-b border-slate-200 pb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-destaque">Painel</p>
          <h2 className="text-2xl font-bold text-slate-900">{titulo}</h2>
          <p className="text-sm text-slate-600">{descricao}</p>
        </div>

        <nav className="mt-4 space-y-2">
          {itensMenu.map((itemMenu) => (
            <Link
              key={itemMenu.href}
              className="block rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-destaque"
              href={itemMenu.href}
            >
              {itemMenu.label}
            </Link>
          ))}
        </nav>
      </aside>

      <section className="space-y-6">{children}</section>
    </div>
  );
}
