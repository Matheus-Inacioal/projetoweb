import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder";

  const supabase = createServerClient(
    url,
    key,
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

  // Buscar perfil correspondente na tabela usuarios para confirmar a existência do perfil
  let usuarioPerfil = null;
  if (user) {
    try {
      const { data, error } = await supabase
        .from("usuarios")
        .select("tipo_usuario")
        .eq("id", user.id)
        .single();
      if (!error && data) {
        usuarioPerfil = data;
      }
    } catch (e) {
      console.error("Erro ao buscar perfil no middleware:", e);
    }
  }

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

  // Redirecionamento se não estiver autenticado ou não tiver perfil cadastrado
  if (!usuarioPerfil && ehRotaProtegida) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    return NextResponse.redirect(redirectUrl);
  }

  // Redirecionamento se estiver autenticado com perfil e tentar acessar login/cadastro
  if (usuarioPerfil && (path.startsWith("/login") || path.startsWith("/cadastro"))) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/dashboard";
    return NextResponse.redirect(redirectUrl);
  }

  // Proteção de rotas específicas baseadas no tipo de usuário
  if (usuarioPerfil) {
    const tipoUsuario = usuarioPerfil.tipo_usuario;

    if (path.startsWith("/admin") && tipoUsuario !== "admin") {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/dashboard";
      return NextResponse.redirect(redirectUrl);
    }

    if (path.startsWith("/agenda") && tipoUsuario !== "prestador") {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/dashboard";
      return NextResponse.redirect(redirectUrl);
    }

    if (path.startsWith("/favoritos") && tipoUsuario !== "consumidor") {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/dashboard";
      return NextResponse.redirect(redirectUrl);
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
