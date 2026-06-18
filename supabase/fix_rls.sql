-- ====================================================================
-- BarberGo RLS Infinite Recursion Fix
-- Execute this patch in your Supabase SQL Editor to resolve the error
-- "infinite recursion detected in policy for relation 'usuarios'".
-- ====================================================================

-- 1. Drop the old problematic policies
drop policy if exists "Usuarios - acesso total admin" on usuarios;
drop policy if exists "Prestadores - acesso total admin" on prestadores;
drop policy if exists "Consumidores - acesso total admin" on consumidores;
drop policy if exists "Servicos - acesso total admin" on servicos;
drop policy if exists "Agenda - acesso total admin" on agenda;
drop policy if exists "Agendamentos - acesso total admin" on agendamentos;
drop policy if exists "Pagamentos - acesso total admin" on pagamentos;
drop policy if exists "Avaliacoes - acesso total admin" on avaliacoes;
drop policy if exists "Favoritos - acesso total admin" on favoritos;
drop policy if exists "Anuncios - acesso total admin" on anuncios;
drop policy if exists "Produtos - acesso total admin" on produtos;
drop policy if exists "Pedidos - acesso total admin" on pedidos;
drop policy if exists "PedidoItens - acesso total admin" on pedido_itens;
drop policy if exists "PagProdutos - acesso total admin" on pagamentos_produtos;

-- 2. Drop the old function if it existed
drop function if exists public.eh_admin(uuid) cascade;

-- 3. Create the security definer helper function
-- This function runs with superuser privileges, bypassing RLS to avoid infinite recursion
create or replace function public.eh_admin(user_id uuid)
returns boolean as $$
begin
  return exists (
    select 1 from public.usuarios
    where id = user_id and tipo_usuario = 'admin'
  );
end;
$$ language plpgsql security definer;

comment on function public.eh_admin(uuid) is 'Verifica se um usuário é administrador sem disparar recursão de RLS';

-- 4. Re-create the admin policies using the helper function
create policy "Usuarios - acesso total admin" on usuarios for all to authenticated
  using (public.eh_admin(auth.uid()));

create policy "Prestadores - acesso total admin" on prestadores for all to authenticated
  using (public.eh_admin(auth.uid()));

create policy "Consumidores - acesso total admin" on consumidores for all to authenticated
  using (public.eh_admin(auth.uid()));

create policy "Servicos - acesso total admin" on servicos for all to authenticated
  using (public.eh_admin(auth.uid()));

create policy "Agenda - acesso total admin" on agenda for all to authenticated
  using (public.eh_admin(auth.uid()));

create policy "Agendamentos - acesso total admin" on agendamentos for all to authenticated
  using (public.eh_admin(auth.uid()));

create policy "Pagamentos - acesso total admin" on pagamentos for all to authenticated
  using (public.eh_admin(auth.uid()));

create policy "Avaliacoes - acesso total admin" on avaliacoes for all to authenticated
  using (public.eh_admin(auth.uid()));

create policy "Favoritos - acesso total admin" on favoritos for all to authenticated
  using (public.eh_admin(auth.uid()));

create policy "Anuncios - acesso total admin" on anuncios for all to authenticated
  using (public.eh_admin(auth.uid()));

create policy "Produtos - acesso total admin" on produtos for all to authenticated
  using (public.eh_admin(auth.uid()));

create policy "Pedidos - acesso total admin" on pedidos for all to authenticated
  using (public.eh_admin(auth.uid()));

create policy "PedidoItens - acesso total admin" on pedido_itens for all to authenticated
  using (public.eh_admin(auth.uid()));

create policy "PagProdutos - acesso total admin" on pagamentos_produtos for all to authenticated
  using (public.eh_admin(auth.uid()));
