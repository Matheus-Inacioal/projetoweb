-- ============================================================
-- BarberGo — Schema PostgreSQL para Supabase
-- Execute no SQL Editor do Supabase Dashboard
-- ============================================================

create extension if not exists "uuid-ossp";

-- ============================================================
-- 1. USUARIOS (vinculada a auth.users)
-- ============================================================
create table if not exists usuarios (
  id           uuid primary key references auth.users(id) on delete cascade,
  nome         text not null,
  email        text not null unique,
  telefone     text,
  foto_url     text,
  tipo         text not null check (tipo in ('prestador', 'consumidor', 'admin')),
  criado_em    timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

-- Trigger para criar perfil automaticamente ao signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.usuarios (id, nome, email, telefone, tipo)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nome', ''),
    new.email,
    coalesce(new.raw_user_meta_data->>'telefone', ''),
    coalesce(new.raw_user_meta_data->>'tipo', 'consumidor')
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Trigger para atualizar atualizado_em
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$ language plpgsql;

create trigger on_usuarios_updated
  before update on usuarios
  for each row execute procedure public.handle_updated_at();

-- ============================================================
-- 2. PRESTADORES
-- ============================================================
create table if not exists prestadores (
  id             uuid primary key default uuid_generate_v4(),
  usuario_id     uuid not null unique references usuarios(id) on delete cascade,
  descricao      text not null default '',
  especialidade  text not null default '',
  endereco       text not null default '',
  cidade         text not null default '',
  avaliacao_media real not null default 0,
  ativo          boolean not null default true,
  criado_em      timestamptz not null default now(),
  atualizado_em  timestamptz not null default now()
);

create index if not exists idx_prestadores_usuario on prestadores(usuario_id);
create index if not exists idx_prestadores_cidade on prestadores(cidade);

create trigger on_prestadores_updated
  before update on prestadores
  for each row execute procedure public.handle_updated_at();

-- ============================================================
-- 3. CONSUMIDORES
-- ============================================================
create table if not exists consumidores (
  id           uuid primary key default uuid_generate_v4(),
  usuario_id   uuid not null unique references usuarios(id) on delete cascade,
  criado_em    timestamptz not null default now()
);

create index if not exists idx_consumidores_usuario on consumidores(usuario_id);

-- ============================================================
-- 4. SERVICOS
-- ============================================================
create table if not exists servicos (
  id              uuid primary key default uuid_generate_v4(),
  prestador_id    uuid not null references prestadores(id) on delete cascade,
  nome            text not null,
  descricao       text not null default '',
  preco           real not null,
  duracao_minutos integer not null default 30,
  ativo           boolean not null default true,
  criado_em       timestamptz not null default now()
);

create index if not exists idx_servicos_prestador on servicos(prestador_id);

-- ============================================================
-- 5. AGENDA
-- ============================================================
create table if not exists agenda (
  id            uuid primary key default uuid_generate_v4(),
  prestador_id  uuid not null references prestadores(id) on delete cascade,
  data          date not null,
  hora_inicio   text not null,
  hora_fim      text not null,
  disponivel    boolean not null default true,
  criado_em     timestamptz not null default now(),

  unique (prestador_id, data, hora_inicio)
);

create index if not exists idx_agenda_prestador_data on agenda(prestador_id, data);

-- ============================================================
-- 6. CONTRATACOES
-- ============================================================
create table if not exists contratacoes (
  id              uuid primary key default uuid_generate_v4(),
  consumidor_id   uuid not null references usuarios(id) on delete restrict,
  prestador_id    uuid not null references prestadores(id) on delete restrict,
  agenda_id       uuid references agenda(id) on delete set null,
  servico_id      uuid references servicos(id) on delete set null,
  data            date not null,
  horario         text not null,
  valor           real not null default 0,
  status          text not null default 'PENDENTE' check (status in ('PENDENTE','CONFIRMADO','CONCLUIDO','CANCELADO')),
  observacao      text,
  criado_em       timestamptz not null default now(),
  atualizado_em   timestamptz not null default now()
);

create index if not exists idx_contratacoes_consumidor on contratacoes(consumidor_id);
create index if not exists idx_contratacoes_prestador on contratacoes(prestador_id);
create index if not exists idx_contratacoes_data on contratacoes(data);

create trigger on_contratacoes_updated
  before update on contratacoes
  for each row execute procedure public.handle_updated_at();

-- ============================================================
-- 7. FAVORITOS
-- ============================================================
create table if not exists favoritos (
  id            uuid primary key default uuid_generate_v4(),
  consumidor_id uuid not null references usuarios(id) on delete cascade,
  prestador_id  uuid not null references prestadores(id) on delete cascade,
  criado_em     timestamptz not null default now(),

  unique (consumidor_id, prestador_id)
);

create index if not exists idx_favoritos_consumidor on favoritos(consumidor_id);

-- ============================================================
-- 8. ANUNCIOS
-- ============================================================
create table if not exists anuncios (
  id            uuid primary key default uuid_generate_v4(),
  prestador_id  uuid not null references prestadores(id) on delete cascade,
  titulo        text not null,
  descricao     text not null default '',
  imagem_url    text,
  ativo         boolean not null default true,
  criado_em     timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create index if not exists idx_anuncios_prestador on anuncios(prestador_id);

create trigger on_anuncios_updated
  before update on anuncios
  for each row execute procedure public.handle_updated_at();

-- ============================================================
-- 9. STORAGE BUCKET
-- ============================================================
insert into storage.buckets (id, name, public)
values ('perfis', 'perfis', true)
on conflict (id) do nothing;
