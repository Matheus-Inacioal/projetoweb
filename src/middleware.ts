import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesParaDefinir) {
          cookiesParaDefinir.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );

          supabaseResponse = NextResponse.next({ request });

          cookiesParaDefinir.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        }
      }
    }
  );

  // Refresh da sessão
  const { data: { user } } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  // Rotas protegidas gerais
  const rotasProtegidas = [
    "/dashboard",
    "/perfil",
    "/agenda",
    "/favoritos",
    "/contratacoes",
    "/admin"
  ];

  const ehRotaProtegida = rotasProtegidas.some((rota) => path.startsWith(rota));

  // Redirecionamento se não estiver autenticado
  if (!user && ehRotaProtegida) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Redirecionamento se estiver autenticado e tentar acessar login/cadastro
  if (user && (path.startsWith("/login") || path.startsWith("/cadastro"))) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // Proteção de rotas específicas baseadas no tipo de usuário (tipo no metadata)
  if (user) {
    const tipo = user.user_metadata?.tipo;

    if (path.startsWith("/admin") && tipo !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }

    if (path.startsWith("/agenda") && tipo !== "prestador") {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }

    if (path.startsWith("/favoritos") && tipo !== "consumidor") {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     * - public assets
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"
  ]
};
