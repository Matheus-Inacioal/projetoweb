-- ============================================================
-- BarberGo — Schema PostgreSQL para Supabase
-- Execute este script no SQL Editor do Supabase Dashboard
-- ============================================================

-- Habilitar extensão uuid (já habilitada no Supabase por padrão)
create extension if not exists "uuid-ossp";

-- ============================================================
-- 1. PROFILES (vinculada a auth.users)
-- ============================================================
create table if not exists profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  nome       text not null,
  email      text not null unique,
  perfil     text not null check (perfil in ('CONTRATANTE', 'PRESTADOR_PF', 'PRESTADOR_PJ', 'ADMIN')),
  avatar_url text,
  criado_em  timestamptz not null default now()
);

-- Trigger para criar profile automaticamente ao signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, nome, email, perfil)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nome', ''),
    new.email,
    coalesce(new.raw_user_meta_data->>'perfil', 'CONTRATANTE')
  );
  return new;
end;
$$ language plpgsql security definer;

-- Remover trigger existente se houver
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- 2. BARBEARIAS
-- ============================================================
create table if not exists barbearias (
  id              uuid primary key default uuid_generate_v4(),
  nome            text not null,
  descricao       text not null,
  endereco        text not null,
  telefone        text not null,
  bairro          text not null default '',
  cidade          text not null default '',
  imagem          text,
  avaliacao_media real not null default 0,
  destaque        boolean not null default false,
  responsavel_id  uuid not null references profiles(id) on delete restrict,
  criado_em       timestamptz not null default now()
);

create index if not exists idx_barbearias_responsavel on barbearias(responsavel_id);

-- ============================================================
-- 3. BARBEIROS
-- ============================================================
create table if not exists barbeiros (
  id             uuid primary key default uuid_generate_v4(),
  nome           text not null,
  especialidade  text not null,
  descricao      text not null,
  telefone       text not null,
  ativo          boolean not null default true,
  usuario_id     uuid unique references profiles(id) on delete set null,
  barbearia_id   uuid references barbearias(id) on delete set null,
  criado_em      timestamptz not null default now()
);

create index if not exists idx_barbeiros_barbearia on barbeiros(barbearia_id);

-- ============================================================
-- 4. SERVICOS
-- ============================================================
create table if not exists servicos (
  id              uuid primary key default uuid_generate_v4(),
  nome            text not null,
  descricao       text not null,
  preco           real not null,
  duracao_minutos integer not null,
  ativo           boolean not null default true,
  barbearia_id    uuid not null references barbearias(id) on delete cascade,
  criado_em       timestamptz not null default now()
);

create index if not exists idx_servicos_barbearia on servicos(barbearia_id);

-- ============================================================
-- 5. DISPONIBILIDADES
-- ============================================================
create table if not exists disponibilidades (
  id          uuid primary key default uuid_generate_v4(),
  barbeiro_id uuid not null references barbeiros(id) on delete cascade,
  dia_semana  text not null check (dia_semana in ('DOMINGO','SEGUNDA','TERCA','QUARTA','QUINTA','SEXTA','SABADO')),
  hora_inicio text not null,
  hora_fim    text not null
);

create index if not exists idx_disponibilidades_barbeiro_dia on disponibilidades(barbeiro_id, dia_semana);

-- ============================================================
-- 6. AGENDAMENTOS
-- ============================================================
create table if not exists agendamentos (
  id              uuid primary key default uuid_generate_v4(),
  contratante_id  uuid not null references profiles(id) on delete restrict,
  barbearia_id    uuid not null references barbearias(id) on delete restrict,
  barbeiro_id     uuid not null references barbeiros(id) on delete restrict,
  servico_id      uuid not null references servicos(id) on delete restrict,
  data            date not null,
  hora            text not null,
  status          text not null default 'PENDENTE' check (status in ('PENDENTE','CONFIRMADO','CONCLUIDO','CANCELADO')),
  observacao      text,
  criado_em       timestamptz not null default now(),

  unique (barbeiro_id, data, hora)
);

create index if not exists idx_agendamentos_contratante_data on agendamentos(contratante_id, data);
create index if not exists idx_agendamentos_barbearia_data on agendamentos(barbearia_id, data);
create index if not exists idx_agendamentos_barbeiro_data on agendamentos(barbeiro_id, data);

-- ============================================================
-- 7. AVALIACOES
-- ============================================================
create table if not exists avaliacoes (
  id              uuid primary key default uuid_generate_v4(),
  agendamento_id  uuid not null unique references agendamentos(id) on delete cascade,
  nota            integer not null check (nota >= 1 and nota <= 5),
  comentario      text,
  criado_em       timestamptz not null default now()
);

-- ============================================================
-- 8. FAVORITOS (nova tabela)
-- ============================================================
create table if not exists favoritos (
  id            uuid primary key default uuid_generate_v4(),
  usuario_id    uuid not null references profiles(id) on delete cascade,
  barbearia_id  uuid not null references barbearias(id) on delete cascade,
  criado_em     timestamptz not null default now(),

  unique (usuario_id, barbearia_id)
);

create index if not exists idx_favoritos_usuario on favoritos(usuario_id);

-- ============================================================
-- 9. FOTOS (nova tabela)
-- ============================================================
create table if not exists fotos (
  id            uuid primary key default uuid_generate_v4(),
  barbearia_id  uuid not null references barbearias(id) on delete cascade,
  url           text not null,
  descricao     text,
  criado_em     timestamptz not null default now()
);

create index if not exists idx_fotos_barbearia on fotos(barbearia_id);

-- ============================================================
-- 10. STORAGE BUCKET para fotos
-- ============================================================
insert into storage.buckets (id, name, public)
values ('fotos', 'fotos', true)
on conflict (id) do nothing;
