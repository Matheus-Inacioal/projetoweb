-- ============================================================
-- BarberGo — Schema SQL Completo (PostgreSQL / Supabase)
-- Versão: 3.0 — Compatibilidade Exata com a Especificação
-- ============================================================

-- Extensões necessárias
create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";

-- ============================================================
-- 0. LIMPEZA COMPLETA (permite re-execução segura)
-- ============================================================

-- Dropar views primeiro
drop view if exists vw_dashboard_admin cascade;
drop view if exists vw_agendamentos_detalhados cascade;
drop view if exists vw_prestadores_ranking cascade;
drop view if exists vw_faturamento_prestador cascade;

-- Dropar tabelas na ordem correta (dependências inversas)
drop table if exists pagamentos_produtos cascade;
drop table if exists pedido_itens cascade;
drop table if exists pedidos cascade;
drop table if exists carrinho_itens cascade;
drop table if exists carrinhos cascade;
drop table if exists produtos cascade;
drop table if exists favoritos cascade;
drop table if exists avaliacoes cascade;
drop table if exists pagamentos cascade;
drop table if exists agendamentos cascade;
drop table if exists agenda cascade;
drop table if exists servicos cascade;
drop table if exists anuncios cascade;
drop table if exists prestadores cascade;
drop table if exists consumidores cascade;
drop table if exists usuarios cascade;

-- Dropar enums
drop type if exists tipo_usuario cascade;
drop type if exists status_agendamento cascade;
drop type if exists status_pagamento cascade;
drop type if exists status_pedido cascade;

-- Dropar funções
drop function if exists public.eh_admin(uuid) cascade;
drop function if exists public.handle_new_user() cascade;
drop function if exists public.atualizar_updated_at() cascade;
drop function if exists public.atualizar_avaliacao_media() cascade;

-- ============================================================
-- 1. ENUMS DO SISTEMA
-- ============================================================

-- Tipo de usuário no sistema
create type tipo_usuario as enum ('admin', 'prestador', 'consumidor');
comment on type tipo_usuario is 'Tipos de usuário do BarberGo';

-- Status dos agendamentos
create type status_agendamento as enum (
  'pendente',
  'aguardando_pagamento',
  'pago',
  'concluido',
  'cancelado'
);
comment on type status_agendamento is 'Status possíveis de um agendamento de serviço';

-- Status dos pagamentos (Mercado Pago)
create type status_pagamento as enum (
  'pendente',
  'aprovado',
  'rejeitado',
  'cancelado',
  'estornado'
);
comment on type status_pagamento is 'Status de pagamentos via Mercado Pago PIX';

-- Status dos pedidos de produtos
create type status_pedido as enum (
  'aguardando_pagamento',
  'pago',
  'enviado',
  'entregue',
  'cancelado'
);
comment on type status_pedido is 'Status possíveis de um pedido de produtos';

-- ============================================================
-- 2. FUNÇÃO DE TRIGGER PARA updated_at
-- ============================================================

create or replace function public.atualizar_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;
comment on function public.atualizar_updated_at() is 'Atualiza automaticamente o campo updated_at em qualquer UPDATE';

-- ============================================================
-- 3. TABELAS PRINCIPAIS
-- ============================================================

-- -------------------------------------------------------
-- 3.1 usuarios — Espelho de auth.users com dados extras
-- -------------------------------------------------------
create table usuarios (
  id            uuid primary key references auth.users(id) on delete cascade,
  nome          text not null,
  email         text not null unique,
  telefone      text,
  foto_url      text,
  tipo_usuario  tipo_usuario not null default 'consumidor',
  ativo         boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
comment on table usuarios is 'Tabela principal de usuários — sincronizada com auth.users via trigger';

create trigger trg_usuarios_updated_at
  before update on usuarios
  for each row execute function public.atualizar_updated_at();

-- -------------------------------------------------------
-- 3.2 prestadores — Perfil de barbeiro/prestador
-- -------------------------------------------------------
create table prestadores (
  id                    uuid primary key default gen_random_uuid(),
  usuario_id            uuid not null unique references usuarios(id) on delete cascade,
  descricao             text not null default '',
  especialidade         text not null default '',
  endereco              text not null default '',
  cidade                text not null default '',
  estado                text not null default '',
  cep                   text not null default '',
  avaliacao_media       real not null default 0,
  quantidade_avaliacoes integer not null default 0,
  ativo                 boolean not null default true,
  created_at             timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);
comment on table prestadores is 'Dados do perfil profissional dos barbeiros';

create trigger trg_prestadores_updated_at
  before update on prestadores
  for each row execute function public.atualizar_updated_at();

-- -------------------------------------------------------
-- 3.3 consumidores — Perfil de cliente
-- -------------------------------------------------------
create table consumidores (
  id         uuid primary key default gen_random_uuid(),
  usuario_id uuid not null unique references usuarios(id) on delete cascade,
  created_at  timestamptz not null default now()
);
comment on table consumidores is 'Perfil dos consumidores/clientes do sistema';

-- -------------------------------------------------------
-- 3.4 servicos — Serviços oferecidos pelos prestadores
-- -------------------------------------------------------
create table servicos (
  id              uuid primary key default gen_random_uuid(),
  prestador_id    uuid not null references prestadores(id) on delete cascade,
  nome            text not null,
  descricao       text not null default '',
  preco           numeric(10, 2) not null default 0 check (preco >= 0),
  duracao_minutos integer not null default 30 check (duracao_minutos > 0),
  ativo           boolean not null default true,
  created_at       timestamptz not null default now()
);
comment on table servicos is 'Catálogo de serviços: cortes, barbas, combos, etc.';

-- -------------------------------------------------------
-- 3.5 agenda — Disponibilidade dos prestadores
-- -------------------------------------------------------
create table agenda (
  id           uuid primary key default gen_random_uuid(),
  prestador_id uuid not null references prestadores(id) on delete cascade,
  data         date not null,
  hora_inicio  time not null,
  hora_fim     time not null,
  disponivel   boolean not null default true,
  constraint unique_agenda_prestador_data_hora unique (prestador_id, data, hora_inicio)
);
comment on table agenda is 'Horários disponíveis de cada prestador por dia';

-- -------------------------------------------------------
-- 3.6 agendamentos — Reservas de serviços pelos consumidores
-- -------------------------------------------------------
create table agendamentos (
  id            uuid primary key default gen_random_uuid(),
  consumidor_id uuid not null references consumidores(id) on delete cascade,
  prestador_id  uuid not null references prestadores(id) on delete cascade,
  servico_id    uuid references servicos(id) on delete set null,
  agenda_id     uuid references agenda(id) on delete set null,
  status        status_agendamento not null default 'pendente',
  valor_total   numeric(10, 2) not null default 0 check (valor_total >= 0),
  observacoes   text,
  created_at     timestamptz not null default now()
);
comment on table agendamentos is 'Agendamentos de serviços feitos pelos consumidores';

-- -------------------------------------------------------
-- 3.7 pagamentos — Pagamentos PIX via Mercado Pago (Agendamentos)
-- -------------------------------------------------------
create table pagamentos (
  id                             uuid primary key default gen_random_uuid(),
  agendamento_id                 uuid not null references agendamentos(id) on delete cascade,
  mercado_pago_payment_id        text,
  external_reference             text,
  qr_code                        text,
  qr_code_base64                 text,
  valor                          numeric(10, 2) not null default 0 check (valor >= 0),
  status                         status_pagamento not null default 'pendente',
  created_at                      timestamptz not null default now()
);
comment on table pagamentos is 'Registros de pagamentos via PIX Mercado Pago para agendamentos';

-- -------------------------------------------------------
-- 3.8 avaliacoes — Notas e comentários dos consumidores
-- -------------------------------------------------------
create table avaliacoes (
  id            uuid primary key default gen_random_uuid(),
  consumidor_id uuid not null references consumidores(id) on delete cascade,
  prestador_id  uuid not null references prestadores(id) on delete cascade,
  nota          integer not null check (nota between 1 and 5),
  comentario    text,
  created_at     timestamptz not null default now()
);
comment on table avaliacoes is 'Avaliações dos consumidores sobre os prestadores';

-- -------------------------------------------------------
-- 3.9 favoritos — Prestadores favoritos do consumidor
-- -------------------------------------------------------
create table favoritos (
  id            uuid primary key default gen_random_uuid(),
  consumidor_id uuid not null references consumidores(id) on delete cascade,
  prestador_id  uuid not null references prestadores(id) on delete cascade,
  created_at     timestamptz not null default now(),
  constraint unique_favorito unique (consumidor_id, prestador_id)
);
comment on table favoritos is 'Lista de prestadores favoritos de cada consumidor';

-- -------------------------------------------------------
-- 3.10 anuncios — Promoções e destaques dos prestadores
-- -------------------------------------------------------
create table anuncios (
  id           uuid primary key default gen_random_uuid(),
  prestador_id uuid not null references prestadores(id) on delete cascade,
  titulo       text not null,
  descricao    text not null default '',
  imagem_url   text,
  ativo        boolean not null default true,
  created_at    timestamptz not null default now()
);
comment on table anuncios is 'Anúncios promocionais dos prestadores';

-- -------------------------------------------------------
-- 3.11 produtos — Catálogo de produtos à venda
-- -------------------------------------------------------
create table produtos (
  id           uuid primary key default gen_random_uuid(),
  prestador_id uuid not null references prestadores(id) on delete cascade,
  nome         text not null,
  descricao    text not null default '',
  preco        numeric(10, 2) not null default 0 check (preco >= 0),
  estoque      integer not null default 0 check (estoque >= 0),
  imagem_url   text,
  ativo        boolean not null default true,
  created_at    timestamptz not null default now()
);
comment on table produtos is 'Produtos à venda pelos prestadores: pomadas, shampoos, etc.';

-- -------------------------------------------------------
-- 3.12 carrinhos — Carrinho de compras do consumidor
-- -------------------------------------------------------
create table carrinhos (
  id            uuid primary key default gen_random_uuid(),
  consumidor_id uuid not null references consumidores(id) on delete cascade,
  created_at     timestamptz not null default now()
);
comment on table carrinhos is 'Carrinho de compras ativo do consumidor';

-- -------------------------------------------------------
-- 3.13 carrinho_itens — Itens no carrinho
-- -------------------------------------------------------
create table carrinho_itens (
  id             uuid primary key default gen_random_uuid(),
  carrinho_id    uuid not null references carrinhos(id) on delete cascade,
  produto_id     uuid not null references produtos(id) on delete cascade,
  quantidade     integer not null default 1 check (quantidade > 0),
  preco_unitario numeric(10, 2) not null default 0 check (preco_unitario >= 0)
);
comment on table carrinho_itens is 'Itens individuais adicionados ao carrinho';

-- -------------------------------------------------------
-- 3.14 pedidos — Pedidos de produtos finalizados
-- -------------------------------------------------------
create table pedidos (
  id            uuid primary key default gen_random_uuid(),
  consumidor_id uuid not null references consumidores(id) on delete cascade,
  valor_total   numeric(10, 2) not null default 0 check (valor_total >= 0),
  status        status_pedido not null default 'aguardando_pagamento',
  created_at     timestamptz not null default now()
);
comment on table pedidos is 'Pedidos de compra de produtos';

-- -------------------------------------------------------
-- 3.15 pedido_itens — Itens de cada pedido
-- -------------------------------------------------------
create table pedido_itens (
  id             uuid primary key default gen_random_uuid(),
  pedido_id      uuid not null references pedidos(id) on delete cascade,
  produto_id     uuid not null references produtos(id) on delete cascade,
  quantidade     integer not null default 1 check (quantidade > 0),
  preco_unitario numeric(10, 2) not null default 0 check (preco_unitario >= 0)
);
comment on table pedido_itens is 'Itens individuais pertencentes a um pedido';

-- -------------------------------------------------------
-- 3.16 pagamentos_produtos — Pagamentos PIX de pedidos
-- -------------------------------------------------------
create table pagamentos_produtos (
  id                             uuid primary key default gen_random_uuid(),
  pedido_id                      uuid not null references pedidos(id) on delete cascade,
  mercado_pago_payment_id        text,
  external_reference             text,
  qr_code                        text,
  qr_code_base64                 text,
  valor                          numeric(10, 2) not null default 0 check (valor >= 0),
  status                         status_pagamento not null default 'pendente',
  created_at                      timestamptz not null default now()
);
comment on table pagamentos_produtos is 'Pagamentos via PIX Mercado Pago para pedidos de produtos';

-- ============================================================
-- 4. TRIGGER PARA CRIAÇÃO AUTOMÁTICA DE PERFIS (Supabase Auth)
-- ============================================================

create or replace function public.handle_new_user()
returns trigger as $$
declare
  v_nome text;
  v_telefone text;
  v_tipo tipo_usuario;
begin
  v_nome := coalesce(new.raw_user_meta_data->>'nome', '');
  v_telefone := coalesce(new.raw_user_meta_data->>'telefone', '');
  v_tipo := coalesce(new.raw_user_meta_data->>'tipo_usuario', 'consumidor')::tipo_usuario;

  insert into public.usuarios (id, nome, email, telefone, tipo_usuario)
  values (new.id, v_nome, new.email, v_telefone, v_tipo);

  if v_tipo = 'prestador' then
    insert into public.prestadores (usuario_id)
    values (new.id);
  elsif v_tipo = 'consumidor' then
    insert into public.consumidores (usuario_id)
    values (new.id);
  end if;

  return new;
end;
$$ language plpgsql security definer;
comment on function public.handle_new_user() is 'Cria perfil automaticamente quando um novo usuário se registra via Supabase Auth';

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- 5. TRIGGER PARA ATUALIZAÇÃO AUTOMÁTICA DE AVALIAÇÃO MÉDIA
-- ============================================================

create or replace function public.atualizar_avaliacao_media()
returns trigger as $$
begin
  update prestadores
  set avaliacao_media = (
    select coalesce(avg(nota), 0) from avaliacoes where prestador_id = coalesce(new.prestador_id, old.prestador_id)
  ),
  quantidade_avaliacoes = (
    select count(*) from avaliacoes where prestador_id = coalesce(new.prestador_id, old.prestador_id)
  )
  where id = coalesce(new.prestador_id, old.prestador_id);

  return coalesce(new, old);
end;
$$ language plpgsql security definer;
comment on function public.atualizar_avaliacao_media() is 'Recalcula média e total de avaliações do prestador após INSERT/UPDATE/DELETE';

drop trigger if exists trg_avaliacoes_media on avaliacoes;
create trigger trg_avaliacoes_media
  after insert or update or delete on avaliacoes
  for each row execute function public.atualizar_avaliacao_media();

-- ============================================================
-- 5.1 FUNÇÃO AUXILIAR PARA VERIFICAÇÃO DE ADMIN (Prevenir Recursão de RLS)
-- ============================================================

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

-- ============================================================
-- 6. STORAGE BUCKETS (Supabase)
-- ============================================================

insert into storage.buckets (id, name, public)
values 
  ('perfil', 'perfil', true),
  ('produtos', 'produtos', true),
  ('anuncios', 'anuncios', true)
on conflict (id) do nothing;

-- ============================================================
-- 7. ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Ativar RLS em todas as tabelas
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

-- -------------------------------------------------------
-- Políticas: usuarios
-- -------------------------------------------------------
create policy "Usuarios - acesso total admin" on usuarios for all to authenticated
  using (public.eh_admin(auth.uid()));
create policy "Usuarios - visualizacao por logados" on usuarios for select to authenticated
  using (true);
create policy "Usuarios - edicao propria" on usuarios for update to authenticated
  using (auth.uid() = id) with check (auth.uid() = id);

-- -------------------------------------------------------
-- Políticas: prestadores
-- -------------------------------------------------------
create policy "Prestadores - acesso total admin" on prestadores for all to authenticated
  using (public.eh_admin(auth.uid()));
create policy "Prestadores - visualizacao geral" on prestadores for select
  using (true);
create policy "Prestadores - edicao propria" on prestadores for update to authenticated
  using (auth.uid() = usuario_id);

-- -------------------------------------------------------
-- Políticas: consumidores
-- -------------------------------------------------------
create policy "Consumidores - acesso total admin" on consumidores for all to authenticated
  using (public.eh_admin(auth.uid()));
create policy "Consumidores - visualizacao geral" on consumidores for select to authenticated
  using (true);

-- -------------------------------------------------------
-- Políticas: servicos
-- -------------------------------------------------------
create policy "Servicos - acesso total admin" on servicos for all to authenticated
  using (public.eh_admin(auth.uid()));
create policy "Servicos - visualizacao geral" on servicos for select
  using (true);
create policy "Servicos - prestador gerencia proprios" on servicos for all to authenticated
  using (exists (select 1 from prestadores p where p.id = prestador_id and p.usuario_id = auth.uid()));

-- -------------------------------------------------------
-- Políticas: agenda
-- -------------------------------------------------------
create policy "Agenda - acesso total admin" on agenda for all to authenticated
  using (public.eh_admin(auth.uid()));
create policy "Agenda - visualizacao geral" on agenda for select
  using (true);
create policy "Agenda - prestador gerencia propria" on agenda for all to authenticated
  using (exists (select 1 from prestadores p where p.id = prestador_id and p.usuario_id = auth.uid()));

-- -------------------------------------------------------
-- Políticas: agendamentos
-- -------------------------------------------------------
create policy "Agendamentos - acesso total admin" on agendamentos for all to authenticated
  using (public.eh_admin(auth.uid()));
create policy "Agendamentos - consumidor cria" on agendamentos for insert to authenticated
  with check (exists (select 1 from consumidores c where c.id = consumidor_id and c.usuario_id = auth.uid()));
create policy "Agendamentos - consumidor visualiza proprio" on agendamentos for select to authenticated
  using (exists (select 1 from consumidores c where c.id = consumidor_id and c.usuario_id = auth.uid()));
create policy "Agendamentos - consumidor atualiza proprio" on agendamentos for update to authenticated
  using (exists (select 1 from consumidores c where c.id = consumidor_id and c.usuario_id = auth.uid()));
create policy "Agendamentos - prestador visualiza recebidos" on agendamentos for select to authenticated
  using (exists (select 1 from prestadores p where p.id = prestador_id and p.usuario_id = auth.uid()));
create policy "Agendamentos - prestador atualiza recebidos" on agendamentos for update to authenticated
  using (exists (select 1 from prestadores p where p.id = prestador_id and p.usuario_id = auth.uid()));

-- -------------------------------------------------------
-- Políticas: pagamentos
-- -------------------------------------------------------
create policy "Pagamentos - acesso total admin" on pagamentos for all to authenticated
  using (public.eh_admin(auth.uid()));
create policy "Pagamentos - consumidor cria" on pagamentos for insert to authenticated
  with check (exists (
    select 1 from agendamentos ag
    join consumidores c on c.id = ag.consumidor_id
    where ag.id = agendamento_id and c.usuario_id = auth.uid()
  ));
create policy "Pagamentos - visualizacao relacionada" on pagamentos for select to authenticated
  using (exists (
    select 1 from agendamentos ag
    left join consumidores c on c.id = ag.consumidor_id
    left join prestadores p on p.id = ag.prestador_id
    where ag.id = agendamento_id and (c.usuario_id = auth.uid() or p.usuario_id = auth.uid())
  ));

-- -------------------------------------------------------
-- Políticas: avaliacoes
-- -------------------------------------------------------
create policy "Avaliacoes - acesso total admin" on avaliacoes for all to authenticated
  using (public.eh_admin(auth.uid()));
create policy "Avaliacoes - visualizacao geral" on avaliacoes for select
  using (true);
create policy "Avaliacoes - consumidor cria" on avaliacoes for insert to authenticated
  with check (exists (select 1 from consumidores c where c.id = consumidor_id and c.usuario_id = auth.uid()));

-- -------------------------------------------------------
-- Políticas: favoritos
-- -------------------------------------------------------
create policy "Favoritos - acesso total admin" on favoritos for all to authenticated
  using (public.eh_admin(auth.uid()));
create policy "Favoritos - consumidor gerencia proprios" on favoritos for all to authenticated
  using (exists (select 1 from consumidores c where c.id = consumidor_id and c.usuario_id = auth.uid()));

-- -------------------------------------------------------
-- Políticas: anuncios
-- -------------------------------------------------------
create policy "Anuncios - acesso total admin" on anuncios for all to authenticated
  using (public.eh_admin(auth.uid()));
create policy "Anuncios - visualizacao geral" on anuncios for select
  using (true);
create policy "Anuncios - prestador gerencia proprios" on anuncios for all to authenticated
  using (exists (select 1 from prestadores p where p.id = prestador_id and p.usuario_id = auth.uid()));

-- -------------------------------------------------------
-- Políticas: produtos
-- -------------------------------------------------------
create policy "Produtos - acesso total admin" on produtos for all to authenticated
  using (public.eh_admin(auth.uid()));
create policy "Produtos - visualizacao geral" on produtos for select
  using (true);
create policy "Produtos - prestador gerencia proprios" on produtos for all to authenticated
  using (exists (select 1 from prestadores p where p.id = prestador_id and p.usuario_id = auth.uid()));

-- -------------------------------------------------------
-- Políticas: carrinhos e carrinho_itens
-- -------------------------------------------------------
create policy "Carrinho - consumidor gerencia proprio" on carrinhos for all to authenticated
  using (exists (select 1 from consumidores c where c.id = consumidor_id and c.usuario_id = auth.uid()));
create policy "CarrinhoItens - consumidor gerencia" on carrinho_itens for all to authenticated
  using (exists (
    select 1 from carrinhos cr
    join consumidores c on c.id = cr.consumidor_id
    where cr.id = carrinho_id and c.usuario_id = auth.uid()
  ));

-- -------------------------------------------------------
-- Políticas: pedidos e pedido_itens
-- -------------------------------------------------------
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

-- -------------------------------------------------------
-- Políticas: pagamentos_produtos
-- -------------------------------------------------------
create policy "PagProdutos - acesso total admin" on pagamentos_produtos for all to authenticated
  using (public.eh_admin(auth.uid()));
create policy "PagProdutos - consumidor visualiza" on pagamentos_produtos for select to authenticated
  using (exists (
    select 1 from pedidos pd
    join consumidores c on c.id = pd.consumidor_id
    where pd.id = pedido_id and c.usuario_id = auth.uid()
  ));

-- -------------------------------------------------------
-- Políticas: Storage (Buckets)
-- -------------------------------------------------------
drop policy if exists "Storage - select publico" on storage.objects;
drop policy if exists "Storage - insert por autenticados" on storage.objects;
drop policy if exists "Storage - delete por autenticados" on storage.objects;

create policy "Storage - select publico" on storage.objects for select
  using (bucket_id in ('perfil', 'produtos', 'anuncios'));
create policy "Storage - insert por autenticados" on storage.objects for insert to authenticated
  with check (bucket_id in ('perfil', 'produtos', 'anuncios'));
create policy "Storage - delete por autenticados" on storage.objects for delete to authenticated
  using (bucket_id in ('perfil', 'produtos', 'anuncios'));

-- ============================================================
-- 8. ÍNDICES DE DESEMPENHO
-- ============================================================

create index if not exists idx_usuarios_tipo on usuarios(tipo_usuario);
create index if not exists idx_usuarios_email on usuarios(email);
create index if not exists idx_usuarios_ativo on usuarios(ativo);

create index if not exists idx_prestadores_usuario on prestadores(usuario_id);
create index if not exists idx_prestadores_cidade on prestadores(cidade);
create index if not exists idx_prestadores_ativo on prestadores(ativo);
create index if not exists idx_prestadores_avaliacao on prestadores(avaliacao_media desc);

create index if not exists idx_consumidores_usuario on consumidores(usuario_id);

create index if not exists idx_servicos_prestador on servicos(prestador_id);
create index if not exists idx_servicos_ativo on servicos(ativo);

create index if not exists idx_agenda_prestador on agenda(prestador_id);
create index if not exists idx_agenda_data on agenda(data);
create index if not exists idx_agenda_prestador_data on agenda(prestador_id, data);

create index if not exists idx_agendamentos_consumidor on agendamentos(consumidor_id);
create index if not exists idx_agendamentos_prestador on agendamentos(prestador_id);
create index if not exists idx_agendamentos_status on agendamentos(status);
create index if not exists idx_agendamentos_criado on agendamentos(created_at desc);

create index if not exists idx_pagamentos_agendamento on pagamentos(agendamento_id);
create index if not exists idx_pagamentos_status on pagamentos(status);

create index if not exists idx_avaliacoes_consumidor on avaliacoes(consumidor_id);
create index if not exists idx_avaliacoes_prestador on avaliacoes(prestador_id);

create index if not exists idx_favoritos_consumidor on favoritos(consumidor_id);
create index if not exists idx_favoritos_prestador on favoritos(prestador_id);

create index if not exists idx_anuncios_prestador on anuncios(prestador_id);
create index if not exists idx_anuncios_ativo on anuncios(ativo);

create index if not exists idx_produtos_prestador on produtos(prestador_id);
create index if not exists idx_produtos_ativo on produtos(ativo);

create index if not exists idx_carrinho_consumidor on carrinhos(consumidor_id);
create index if not exists idx_carrinho_itens_carrinho on carrinho_itens(carrinho_id);

create index if not exists idx_pedidos_consumidor on pedidos(consumidor_id);
create index if not exists idx_pedidos_status on pedidos(status);

create index if not exists idx_pagprod_pedido on pagamentos_produtos(pedido_id);
create index if not exists idx_pagprod_status on pagamentos_produtos(status);

-- ============================================================
-- 9. VIEWS ÚTEIS PARA DASHBOARD
-- ============================================================

-- View: Resumo geral do painel administrativo
create or replace view vw_dashboard_admin as
select
  (select count(*) from usuarios) as total_usuarios,
  (select count(*) from usuarios where tipo_usuario = 'prestador') as total_prestadores,
  (select count(*) from usuarios where tipo_usuario = 'consumidor') as total_consumidores,
  (select count(*) from agendamentos) as total_agendamentos,
  (select count(*) from agendamentos where status = 'concluido') as agendamentos_concluidos,
  (select count(*) from agendamentos where status = 'pendente') as agendamentos_pendentes,
  (select coalesce(sum(valor), 0) from pagamentos where status = 'aprovado') as receita_servicos,
  (select count(*) from produtos) as total_produtos,
  (select count(*) from pedidos) as total_pedidos,
  (select coalesce(sum(valor), 0) from pagamentos_produtos where status = 'aprovado') as receita_produtos,
  (select count(*) from anuncios where ativo = true) as anuncios_ativos;
comment on view vw_dashboard_admin is 'Resumo geral do sistema para o painel administrativo';

-- View: Agendamentos detalhados (com nomes dos envolvidos e serviço)
create or replace view vw_agendamentos_detalhados as
select
  ag.id as agendamento_id,
  ag.status,
  ag.valor_total as valor,
  ag.observacoes as observacao,
  ag.created_at,
  uc.nome as consumidor_nome,
  uc.email as consumidor_email,
  up.nome as prestador_nome,
  p.especialidade as prestador_especialidade,
  s.nome as servico_nome,
  s.duracao_minutos,
  a.data as agenda_data,
  a.hora_inicio,
  a.hora_fim
from agendamentos ag
left join consumidores c on c.id = ag.consumidor_id
left join usuarios uc on uc.id = c.usuario_id
left join prestadores p on p.id = ag.prestador_id
left join usuarios up on up.id = p.usuario_id
left join servicos s on s.id = ag.servico_id
left join agenda a on a.id = ag.agenda_id;
comment on view vw_agendamentos_detalhados is 'Visão completa dos agendamentos com dados de consumidor, prestador e serviço';

-- View: Ranking de prestadores por avaliação
create or replace view vw_prestadores_ranking as
select
  p.id as prestador_id,
  u.nome,
  p.especialidade,
  p.cidade,
  p.estado,
  p.avaliacao_media,
  p.quantidade_avaliacoes,
  (select count(*) from agendamentos ag where ag.prestador_id = p.id and ag.status = 'concluido') as total_atendimentos,
  (select count(*) from servicos sv where sv.prestador_id = p.id and sv.ativo = true) as servicos_ativos
from prestadores p
join usuarios u on u.id = p.usuario_id
where p.ativo = true
order by p.avaliacao_media desc, p.quantidade_avaliacoes desc;
comment on view vw_prestadores_ranking is 'Ranking dos prestadores por avaliação média e quantidade de atendimentos';

-- View: Faturamento por prestador
create or replace view vw_faturamento_prestador as
select
  p.id as prestador_id,
  u.nome as prestador_nome,
  count(ag.id) as total_agendamentos,
  count(ag.id) filter (where ag.status = 'concluido') as concluidos,
  coalesce(sum(ag.valor_total) filter (where ag.status in ('pago', 'concluido')), 0) as faturamento_total
from prestadores p
join usuarios u on u.id = p.usuario_id
left join agendamentos ag on ag.prestador_id = p.id
group by p.id, u.nome
order by faturamento_total desc;
comment on view vw_faturamento_prestador is 'Resumo financeiro por prestador';

-- ============================================================
-- FIM DO SCHEMA
-- ============================================================
