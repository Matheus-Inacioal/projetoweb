import { createClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase com Service Role Key.
 * Bypass completo de RLS — usar APENAS em operações de admin no servidor.
 */
export function criarClienteSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
}
