-- ====================================================================
-- BarberGo — Row Level Security (RLS) Policies
-- Versão: 3.0
-- ====================================================================

-- --------------------------------------------------------------------
-- 1. ATIVAR RLS EM TODAS AS TABELAS
-- --------------------------------------------------------------------
alter table usuarios enable row level security;
alter table prestadores enable row level security;
alter table consumidores enable row level security;
alter table servicos enable row level security;
alter table agenda enable row level security;
alter table agendamentos enable row level security;
alter table pagamentos enable row level security;
alter table avaliacoes enable row level security;
alter table favoritos enable row level security;
alter table anuncios enable row level security;
alter table produtos enable row level security;
alter table carrinhos enable row level security;
alter table carrinho_itens enable row level security;
alter table pedidos enable row level security;
alter table pedido_itens enable row level security;
alter table pagamentos_produtos enable row level security;

-- --------------------------------------------------------------------
-- 2. FUNÇÃO AUXILIAR PARA VERIFICAÇÃO DE ADMIN (Prevenir Recursão)
-- --------------------------------------------------------------------
drop function if exists public.eh_admin(uuid) cascade;

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

-- --------------------------------------------------------------------
-- 3. POLÍTICAS DE ACESSO
-- --------------------------------------------------------------------

-- 3.1 usuarios
drop policy if exists "Usuarios - acesso total admin" on usuarios;
drop policy if exists "Usuarios - visualizacao por logados" on usuarios;
drop policy if exists "Usuarios - edicao propria" on usuarios;

create policy "Usuarios - acesso total admin" on usuarios for all to authenticated
  using (public.eh_admin(auth.uid()));
create policy "Usuarios - visualizacao por logados" on usuarios for select to authenticated
  using (true);
create policy "Usuarios - edicao propria" on usuarios for update to authenticated
  using (auth.uid() = id) with check (auth.uid() = id);

-- 3.2 prestadores
drop policy if exists "Prestadores - acesso total admin" on prestadores;
drop policy if exists "Prestadores - visualizacao geral" on prestadores;
drop policy if exists "Prestadores - edicao propria" on prestadores;

create policy "Prestadores - acesso total admin" on prestadores for all to authenticated
  using (public.eh_admin(auth.uid()));
create policy "Prestadores - visualizacao geral" on prestadores for select
  using (true);
create policy "Prestadores - edicao propria" on prestadores for update to authenticated
  using (auth.uid() = usuario_id);

-- 3.3 consumidores
drop policy if exists "Consumidores - acesso total admin" on consumidores;
drop policy if exists "Consumidores - visualizacao geral" on consumidores;

create policy "Consumidores - acesso total admin" on consumidores for all to authenticated
  using (public.eh_admin(auth.uid()));
create policy "Consumidores - visualizacao geral" on consumidores for select to authenticated
  using (true);

-- 3.4 servicos
drop policy if exists "Servicos - acesso total admin" on servicos;
drop policy if exists "Servicos - visualizacao geral" on servicos;
drop policy if exists "Servicos - prestador gerencia proprios" on servicos;

create policy "Servicos - acesso total admin" on servicos for all to authenticated
  using (public.eh_admin(auth.uid()));
create policy "Servicos - visualizacao geral" on servicos for select
  using (true);
create policy "Servicos - prestador gerencia proprios" on servicos for all to authenticated
  using (exists (select 1 from prestadores p where p.id = prestador_id and p.usuario_id = auth.uid()));

-- 3.5 agenda
drop policy if exists "Agenda - acesso total admin" on agenda;
drop policy if exists "Agenda - visualizacao geral" on agenda;
drop policy if exists "Agenda - prestador gerencia propria" on agenda;

create policy "Agenda - acesso total admin" on agenda for all to authenticated
  using (public.eh_admin(auth.uid()));
create policy "Agenda - visualizacao geral" on agenda for select
  using (true);
create policy "Agenda - prestador gerencia propria" on agenda for all to authenticated
  using (exists (select 1 from prestadores p where p.id = prestador_id and p.usuario_id = auth.uid()));

-- 3.6 contratacoes
drop policy if exists "Agendamentos - acesso total admin" on contratacoes;
drop policy if exists "Agendamentos - consumidor cria" on contratacoes;
drop policy if exists "Agendamentos - consumidor visualiza proprio" on contratacoes;
drop policy if exists "Agendamentos - consumidor atualiza proprio" on contratacoes;
drop policy if exists "Agendamentos - prestador visualiza recebidos" on contratacoes;
drop policy if exists "Agendamentos - prestador atualiza recebidos" on contratacoes;

drop policy if exists "Contratacoes - acesso total admin" on contratacoes;
drop policy if exists "Contratacoes - consumidor cria" on contratacoes;
drop policy if exists "Contratacoes - consumidor visualiza proprio" on contratacoes;
drop policy if exists "Contratacoes - consumidor atualiza proprio" on contratacoes;
drop policy if exists "Contratacoes - prestador visualiza recebidos" on contratacoes;
drop policy if exists "Contratacoes - prestador atualiza recebidos" on contratacoes;

create policy "Contratacoes - acesso total admin" on contratacoes for all to authenticated
  using (public.eh_admin(auth.uid()));
create policy "Contratacoes - consumidor cria" on contratacoes for insert to authenticated
  with check (exists (select 1 from consumidores c where c.id = consumidor_id and c.usuario_id = auth.uid()));
create policy "Contratacoes - consumidor visualiza proprio" on contratacoes for select to authenticated
  using (exists (select 1 from consumidores c where c.id = consumidor_id and c.usuario_id = auth.uid()));
create policy "Contratacoes - consumidor atualiza proprio" on contratacoes for update to authenticated
  using (exists (select 1 from consumidores c where c.id = consumidor_id and c.usuario_id = auth.uid()));
create policy "Contratacoes - prestador visualiza recebidos" on contratacoes for select to authenticated
  using (exists (select 1 from prestadores p where p.id = prestador_id and p.usuario_id = auth.uid()));
create policy "Contratacoes - prestador atualiza recebidos" on contratacoes for update to authenticated
  using (exists (select 1 from prestadores p where p.id = prestador_id and p.usuario_id = auth.uid()));

-- 3.7 pagamentos
drop policy if exists "Pagamentos - acesso total admin" on pagamentos;
drop policy if exists "Pagamentos - consumidor cria" on pagamentos;
drop policy if exists "Pagamentos - visualizacao relacionada" on pagamentos;

create policy "Pagamentos - acesso total admin" on pagamentos for all to authenticated
  using (public.eh_admin(auth.uid()));
create policy "Pagamentos - consumidor cria" on pagamentos for insert to authenticated
  with check (exists (
    select 1 from contratacoes ag
    join consumidores c on c.id = ag.consumidor_id
    where ag.id = contratacao_id and c.usuario_id = auth.uid()
  ));
create policy "Pagamentos - visualizacao relacionada" on pagamentos for select to authenticated
  using (exists (
    select 1 from contratacoes ag
    left join consumidores c on c.id = ag.consumidor_id
    left join prestadores p on p.id = ag.prestador_id
    where ag.id = contratacao_id and (c.usuario_id = auth.uid() or p.usuario_id = auth.uid())
  ));

-- 3.8 avaliacoes
drop policy if exists "Avaliacoes - acesso total admin" on avaliacoes;
drop policy if exists "Avaliacoes - visualizacao geral" on avaliacoes;
drop policy if exists "Avaliacoes - consumidor cria" on avaliacoes;

create policy "Avaliacoes - acesso total admin" on avaliacoes for all to authenticated
  using (public.eh_admin(auth.uid()));
create policy "Avaliacoes - visualizacao geral" on avaliacoes for select
  using (true);
create policy "Avaliacoes - consumidor cria" on avaliacoes for insert to authenticated
  with check (exists (select 1 from consumidores c where c.id = consumidor_id and c.usuario_id = auth.uid()));

-- 3.9 favoritos
drop policy if exists "Favoritos - acesso total admin" on favoritos;
drop policy if exists "Favoritos - consumidor gerencia proprios" on favoritos;

create policy "Favoritos - acesso total admin" on favoritos for all to authenticated
  using (public.eh_admin(auth.uid()));
create policy "Favoritos - consumidor gerencia proprios" on favoritos for all to authenticated
  using (exists (select 1 from consumidores c where c.id = consumidor_id and c.usuario_id = auth.uid()));

-- 3.10 anuncios
drop policy if exists "Anuncios - acesso total admin" on anuncios;
drop policy if exists "Anuncios - visualizacao geral" on anuncios;
drop policy if exists "Anuncios - prestador gerencia proprios" on anuncios;

create policy "Anuncios - acesso total admin" on anuncios for all to authenticated
  using (public.eh_admin(auth.uid()));
create policy "Anuncios - visualizacao geral" on anuncios for select
  using (true);
create policy "Anuncios - prestador gerencia proprios" on anuncios for all to authenticated
  using (exists (select 1 from prestadores p where p.id = prestador_id and p.usuario_id = auth.uid()));

-- 3.11 produtos
drop policy if exists "Produtos - acesso total admin" on produtos;
drop policy if exists "Produtos - visualizacao geral" on produtos;
drop policy if exists "Produtos - prestador gerencia proprios" on produtos;

create policy "Produtos - acesso total admin" on produtos for all to authenticated
  using (public.eh_admin(auth.uid()));
create policy "Produtos - visualizacao geral" on produtos for select
  using (true);
create policy "Produtos - prestador gerencia proprios" on produtos for all to authenticated
  using (exists (select 1 from prestadores p where p.id = prestador_id and p.usuario_id = auth.uid()));

-- 3.12 carrinhos e carrinho_itens
drop policy if exists "Carrinho - consumidor gerencia proprio" on carrinhos;
drop policy if exists "CarrinhoItens - consumidor gerencia" on carrinho_itens;

create policy "Carrinho - consumidor gerencia proprio" on carrinhos for all to authenticated
  using (exists (select 1 from consumidores c where c.id = consumidor_id and c.usuario_id = auth.uid()));
create policy "CarrinhoItens - consumidor gerencia" on carrinho_itens for all to authenticated
  using (exists (
    select 1 from carrinhos cr
    join consumidores c on c.id = cr.consumidor_id
    where cr.id = carrinho_id and c.usuario_id = auth.uid()
  ));

-- 3.13 pedidos e pedido_itens
drop policy if exists "Pedidos - acesso total admin" on pedidos;
drop policy if exists "Pedidos - consumidor gerencia proprios" on pedidos;
drop policy if exists "PedidoItens - acesso total admin" on pedido_itens;
drop policy if exists "PedidoItens - consumidor visualiza" on pedido_itens;
drop policy if exists "PedidoItens - consumidor cria" on pedido_itens;

create policy "Pedidos - acesso total admin" on pedidos for all to authenticated
  using (public.eh_admin(auth.uid()));
create policy "Pedidos - consumidor gerencia proprios" on pedidos for all to authenticated
  using (exists (select 1 from consumidores c where c.id = consumidor_id and c.usuario_id = auth.uid()));
create policy "PedidoItens - acesso total admin" on pedido_itens for all to authenticated
  using (public.eh_admin(auth.uid()));
create policy "PedidoItens - consumidor visualiza" on pedido_itens for select to authenticated
  using (exists (
    select 1 from pedidos pd
    join consumidores c on c.id = pd.consumidor_id
    where pd.id = pedido_id and c.usuario_id = auth.uid()
  ));
create policy "PedidoItens - consumidor cria" on pedido_itens for insert to authenticated
  with check (exists (
    select 1 from pedidos pd
    join consumidores c on c.id = pd.consumidor_id
    where pd.id = pedido_id and c.usuario_id = auth.uid()
  ));

-- 3.14 pagamentos_produtos
drop policy if exists "PagProdutos - acesso total admin" on pagamentos_produtos;
drop policy if exists "PagProdutos - consumidor visualiza" on pagamentos_produtos;
drop policy if exists "PagProdutos - consumidor cria" on pagamentos_produtos;

create policy "PagProdutos - acesso total admin" on pagamentos_produtos for all to authenticated
  using (public.eh_admin(auth.uid()));
create policy "PagProdutos - consumidor visualiza" on pagamentos_produtos for select to authenticated
  using (exists (
    select 1 from pedidos pd
    join consumidores c on c.id = pd.consumidor_id
    where pd.id = pedido_id and c.usuario_id = auth.uid()
  ));
create policy "PagProdutos - consumidor cria" on pagamentos_produtos for insert to authenticated
  with check (exists (
    select 1 from pedidos pd
    join consumidores c on c.id = pd.consumidor_id
    where pd.id = pedido_id and c.usuario_id = auth.uid()
  ));

-- 3.15 Storage (Buckets)
drop policy if exists "Storage - select publico" on storage.objects;
drop policy if exists "Storage - insert por autenticados" on storage.objects;
drop policy if exists "Storage - delete por autenticados" on storage.objects;

create policy "Storage - select publico" on storage.objects for select
  using (bucket_id in ('perfil', 'produtos', 'anuncios'));
create policy "Storage - insert por autenticados" on storage.objects for insert to authenticated
  with check (bucket_id in ('perfil', 'produtos', 'anuncios'));
create policy "Storage - delete por autenticados" on storage.objects for delete to authenticated
  using (bucket_id in ('perfil', 'produtos', 'anuncios'));

-- 3.16 historico_contratacoes
drop policy if exists "Historico - acesso total admin" on historico_contratacoes;
drop policy if exists "Historico - consumidor visualiza relacionado" on historico_contratacoes;
drop policy if exists "Historico - prestador visualiza relacionado" on historico_contratacoes;
drop policy if exists "Historico - autenticados criam logs" on historico_contratacoes;

create policy "Historico - acesso total admin" on historico_contratacoes for all to authenticated
  using (public.eh_admin(auth.uid()));
create policy "Historico - consumidor visualiza relacionado" on historico_contratacoes for select to authenticated
  using (exists (
    select 1 from contratacoes c
    join consumidores co on co.id = c.consumidor_id
    where c.id = contratacao_id and co.usuario_id = auth.uid()
  ));
create policy "Historico - prestador visualiza relacionado" on historico_contratacoes for select to authenticated
  using (exists (
    select 1 from contratacoes c
    join prestadores pr on pr.id = c.prestador_id
    where c.id = contratacao_id and pr.usuario_id = auth.uid()
  ));
create policy "Historico - autenticados criam logs" on historico_contratacoes for insert to authenticated
  with check (auth.uid() = usuario_id);
