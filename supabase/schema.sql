-- ============================================================
-- BarberGo — Script SQL Completo para Supabase (PostgreSQL)
-- Cole e execute este script no SQL Editor do Supabase Dashboard
-- ============================================================

-- Habilitar a extensão pgcrypto para criptografia se necessário
create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";

-- Limpar tabelas se existirem (para permitir re-execução limpa)
drop table if exists avaliacoes cascade;
drop table if exists pagamentos cascade;
drop table if exists agendamentos cascade;
drop table if exists agenda cascade;
drop table if exists servicos cascade;
drop table if exists anuncios cascade;
drop table if exists prestadores cascade;
drop table if exists consumidores cascade;
drop table if exists usuarios cascade;

-- ============================================================
-- 1. TABELAS DO SISTEMA
-- ============================================================

-- Tabela: usuarios (espelho de auth.users)
create table usuarios (
  id           uuid primary key references auth.users(id) on delete cascade,
  nome         text not null,
  email        text not null unique,
  telefone     text,
  tipo_usuario text not null check (tipo_usuario in ('admin', 'prestador', 'consumidor')),
  criado_em    timestamptz not null default now()
);

-- Tabela: prestadores
create table prestadores (
  id              uuid primary key default gen_random_uuid(),
  usuario_id      uuid not null unique references usuarios(id) on delete cascade,
  descricao       text not null default '',
  especialidade   text not null default '',
  endereco        text not null default '',
  cidade          text not null default '',
  foto_url        text,
  avaliacao_media real not null default 0,
  ativo           boolean not null default true,
  criado_em       timestamptz not null default now()
);

-- Tabela: consumidores
create table consumidores (
  id         uuid primary key default gen_random_uuid(),
  usuario_id uuid not null unique references usuarios(id) on delete cascade,
  criado_em  timestamptz not null default now()
);

-- Tabela: servicos
create table servicos (
  id              uuid primary key default gen_random_uuid(),
  prestador_id    uuid not null references prestadores(id) on delete cascade,
  nome            text not null,
  descricao       text not null default '',
  preco           numeric(10, 2) not null default 0,
  duracao_minutos integer not null default 30,
  ativo           boolean not null default true,
  criado_em       timestamptz not null default now()
);

-- Tabela: agenda (disponibilidade dos prestadores)
create table agenda (
  id           uuid primary key default gen_random_uuid(),
  prestador_id uuid not null references prestadores(id) on delete cascade,
  data         date not null,
  hora_inicio  time not null,
  hora_fim     time not null,
  disponivel   boolean not null default true,
  criado_em    timestamptz not null default now(),
  constraint unique_agenda_prestador_data_hora unique (prestador_id, data, hora_inicio)
);

-- Tabela: agendamentos
create table agendamentos (
  id            uuid primary key default gen_random_uuid(),
  consumidor_id uuid not null references consumidores(id) on delete cascade,
  prestador_id  uuid not null references prestadores(id) on delete cascade,
  servico_id    uuid references servicos(id) on delete set null,
  agenda_id     uuid references agenda(id) on delete set null,
  valor         numeric(10, 2) not null default 0,
  status        varchar(50) not null default 'pendente' check (status in ('pendente', 'pago', 'confirmado', 'concluido', 'cancelado')),
  observacao    text,
  criado_em     timestamptz not null default now()
);

-- Tabela: pagamentos
create table pagamentos (
  id                      uuid primary key default gen_random_uuid(),
  agendamento_id           uuid not null references agendamentos(id) on delete cascade,
  mercado_pago_payment_id text,
  status                  text,
  valor                   numeric(10, 2) not null default 0,
  metodo_pagamento        text,
  criado_em               timestamptz not null default now()
);

-- Tabela: avaliacoes
create table avaliacoes (
  id            uuid primary key default gen_random_uuid(),
  consumidor_id uuid not null references consumidores(id) on delete cascade,
  prestador_id  uuid not null references prestadores(id) on delete cascade,
  nota          integer not null check (nota between 1 and 5),
  comentario    text,
  criado_em     timestamptz not null default now()
);

-- Tabela: anuncios
create table anuncios (
  id           uuid primary key default gen_random_uuid(),
  prestador_id uuid not null references prestadores(id) on delete cascade,
  titulo       text not null,
  descricao    text not null default '',
  imagem_url   text,
  ativo        boolean not null default true,
  criado_em    timestamptz not null default now()
);

-- ============================================================
-- 2. TRIGGER PARA CRIAÇÃO AUTOMÁTICA DE PERFIS
-- ============================================================

create or replace function public.handle_new_user()
returns trigger as $$
declare
  v_nome text;
  v_telefone text;
  v_tipo text;
begin
  v_nome := coalesce(new.raw_user_meta_data->>'nome', '');
  v_telefone := coalesce(new.raw_user_meta_data->>'telefone', '');
  v_tipo := coalesce(new.raw_user_meta_data->>'tipo_usuario', 'consumidor');

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

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- 3. CRIAR BUCKET DO STORAGE
-- ============================================================

insert into storage.buckets (id, name, public)
values ('perfis', 'perfis', true)
on conflict (id) do nothing;

-- ============================================================
-- 4. POLÍTICAS DE ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Ativar RLS
alter table usuarios enable row level security;
alter table prestadores enable row level security;
alter table consumidores enable row level security;
alter table servicos enable row level security;
alter table agenda enable row level security;
alter table agendamentos enable row level security;
alter table pagamentos enable row level security;
alter table avaliacoes enable row level security;
alter table anuncios enable row level security;

-- Políticas: usuarios
create policy "Usuarios - acesso total admin" on usuarios for all to authenticated
  using (exists (select 1 from usuarios where id = auth.uid() and tipo_usuario = 'admin'));
create policy "Usuarios - visualizacao por logados" on usuarios for select to authenticated
  using (true);
create policy "Usuarios - edicao propria" on usuarios for update to authenticated
  using (auth.uid() = id) with check (auth.uid() = id);

-- Políticas: prestadores
create policy "Prestadores - acesso total admin" on prestadores for all to authenticated
  using (exists (select 1 from usuarios where id = auth.uid() and tipo_usuario = 'admin'));
create policy "Prestadores - visualizacao geral" on prestadores for select
  using (true);
create policy "Prestadores - edicao propria" on prestadores for update to authenticated
  using (auth.uid() = usuario_id);

-- Políticas: consumidores
create policy "Consumidores - acesso total admin" on consumidores for all to authenticated
  using (exists (select 1 from usuarios where id = auth.uid() and tipo_usuario = 'admin'));
create policy "Consumidores - visualizacao geral" on consumidores for select to authenticated
  using (true);

-- Políticas: servicos
create policy "Servicos - acesso total admin" on servicos for all to authenticated
  using (exists (select 1 from usuarios where id = auth.uid() and tipo_usuario = 'admin'));
create policy "Servicos - visualizacao geral" on servicos for select
  using (true);
create policy "Servicos - prestador gerencia proprios" on servicos for all to authenticated
  using (exists (select 1 from prestadores p where p.id = prestador_id and p.usuario_id = auth.uid()));

-- Políticas: agenda
create policy "Agenda - acesso total admin" on agenda for all to authenticated
  using (exists (select 1 from usuarios where id = auth.uid() and tipo_usuario = 'admin'));
create policy "Agenda - visualizacao geral" on agenda for select
  using (true);
create policy "Agenda - prestador gerencia propria" on agenda for all to authenticated
  using (exists (select 1 from prestadores p where p.id = prestador_id and p.usuario_id = auth.uid()));

-- Políticas: agendamentos
create policy "Agendamentos - acesso total admin" on agendamentos for all to authenticated
  using (exists (select 1 from usuarios where id = auth.uid() and tipo_usuario = 'admin'));
create policy "Agendamentos - consumidor cria" on agendamentos for insert to authenticated
  with check (exists (select 1 from consumidores c where c.id = consumidor_id and c.usuario_id = auth.uid()));
create policy "Agendamentos - consumidor visualiza e cancela proprio" on agendamentos for all to authenticated
  using (
    exists (select 1 from consumidores c where c.id = consumidor_id and c.usuario_id = auth.uid())
  );
create policy "Agendamentos - prestador visualiza e atualiza recebidos" on agendamentos for all to authenticated
  using (
    exists (select 1 from prestadores p where p.id = prestador_id and p.usuario_id = auth.uid())
  );

-- Políticas: pagamentos
create policy "Pagamentos - acesso total admin" on pagamentos for all to authenticated
  using (exists (select 1 from usuarios where id = auth.uid() and tipo_usuario = 'admin'));
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

-- Políticas: avaliacoes
create policy "Avaliacoes - acesso total admin" on avaliacoes for all to authenticated
  using (exists (select 1 from usuarios where id = auth.uid() and tipo_usuario = 'admin'));
create policy "Avaliacoes - visualizacao geral" on avaliacoes for select
  using (true);
create policy "Avaliacoes - consumidor cria" on avaliacoes for insert to authenticated
  with check (exists (select 1 from consumidores c where c.id = consumidor_id and c.usuario_id = auth.uid()));

-- Políticas: anuncios
create policy "Anuncios - acesso total admin" on anuncios for all to authenticated
  using (exists (select 1 from usuarios where id = auth.uid() and tipo_usuario = 'admin'));
create policy "Anuncios - visualizacao geral" on anuncios for select
  using (true);
create policy "Anuncios - prestador gerencia proprios" on anuncios for all to authenticated
  using (exists (select 1 from prestadores p where p.id = prestador_id and p.usuario_id = auth.uid()));

-- Políticas de Storage para o Bucket 'perfis'
create policy "Storage - select publico" on storage.objects for select
  using (bucket_id = 'perfis');
create policy "Storage - insert por autenticados" on storage.objects for insert to authenticated
  with check (bucket_id = 'perfis');
create policy "Storage - delete por autenticados" on storage.objects for delete to authenticated
  using (bucket_id = 'perfis');

-- ============================================================
-- 5. ÍNDICES DE DESEMPENHO
-- ============================================================
create index if not exists idx_usuarios_tipo on usuarios(tipo_usuario);
create index if not exists idx_prestadores_usuario on prestadores(usuario_id);
create index if not exists idx_consumidores_usuario on consumidores(usuario_id);
create index if not exists idx_servicos_prestador on servicos(prestador_id);
create index if not exists idx_agenda_prestador on agenda(prestador_id);
create index if not exists idx_agenda_data on agenda(data);
create index if not exists idx_agendamentos_consumidor on agendamentos(consumidor_id);
create index if not exists idx_agendamentos_prestador on agendamentos(prestador_id);
create index if not exists idx_agendamentos_servico on agendamentos(servico_id);
create index if not exists idx_agendamentos_agenda on agendamentos(agenda_id);
create index if not exists idx_agendamentos_status on agendamentos(status);
create index if not exists idx_pagamentos_agendamento on pagamentos(agendamento_id);
create index if not exists idx_avaliacoes_consumidor on avaliacoes(consumidor_id);
create index if not exists idx_avaliacoes_prestador on avaliacoes(prestador_id);
create index if not exists idx_anuncios_prestador on anuncios(prestador_id);

-- ============================================================
-- 6. SEED (DADOS DE TESTE)
-- ============================================================

-- UUIDs estáticos para facilitar login e testes
-- Senha padrão criptografada para todos: "123456"
-- Algoritmo bcrypt (Supabase utiliza este formato no encrypted_password)
-- Hash gerado de "123456": $2a$10$wE4j7n6gOEqH1aP8uM9XWutN/vpxG2P0HmWl19cK6zZf9YhS2p2/W

-- Inserir usuários no Auth (com confirmed_at)
insert into auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at, confirmed_at,
  raw_app_meta_data, raw_user_meta_data, is_super_admin, role, aud, created_at, updated_at
) values 
  -- Admin
  ('a0000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000', 'admin@barbergo.com', '$2a$10$wE4j7n6gOEqH1aP8uM9XWutN/vpxG2P0HmWl19cK6zZf9YhS2p2/W', now(), now(), '{"provider":"email","providers":["email"]}', '{"nome":"Gerente Admin","tipo_usuario":"admin"}', false, 'authenticated', 'authenticated', now(), now()),
  -- Prestador 1 (João)
  ('b0000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000', 'joao@barbergo.com', '$2a$10$wE4j7n6gOEqH1aP8uM9XWutN/vpxG2P0HmWl19cK6zZf9YhS2p2/W', now(), now(), '{"provider":"email","providers":["email"]}', '{"nome":"João Barbeiro","tipo_usuario":"prestador","telefone":"(85) 99999-1111"}', false, 'authenticated', 'authenticated', now(), now()),
  -- Prestador 2 (Pedro)
  ('c0000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000', 'pedro@barbergo.com', '$2a$10$wE4j7n6gOEqH1aP8uM9XWutN/vpxG2P0HmWl19cK6zZf9YhS2p2/W', now(), now(), '{"provider":"email","providers":["email"]}', '{"nome":"Pedro Navalha","tipo_usuario":"prestador","telefone":"(85) 99999-2222"}', false, 'authenticated', 'authenticated', now(), now()),
  -- Consumidor 1 (Maria)
  ('d0000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000', 'maria@barbergo.com', '$2a$10$wE4j7n6gOEqH1aP8uM9XWutN/vpxG2P0HmWl19cK6zZf9YhS2p2/W', now(), now(), '{"provider":"email","providers":["email"]}', '{"nome":"Maria Silva","tipo_usuario":"consumidor","telefone":"(85) 98888-3333"}', false, 'authenticated', 'authenticated', now(), now()),
  -- Consumidor 2 (Carlos)
  ('e0000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000', 'carlos@barbergo.com', '$2a$10$wE4j7n6gOEqH1aP8uM9XWutN/vpxG2P0HmWl19cK6zZf9YhS2p2/W', now(), now(), '{"provider":"email","providers":["email"]}', '{"nome":"Carlos Souza","tipo_usuario":"consumidor","telefone":"(85) 98888-4444"}', false, 'authenticated', 'authenticated', now(), now())
on conflict (id) do nothing;

-- Vincular as identidades de login aos usuários criados
insert into auth.identities (
  id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
) values
  ('a0000000-0000-0000-0000-000000000000', 'a0000000-0000-0000-0000-000000000000', jsonb_build_object('sub', 'a0000000-0000-0000-0000-000000000000', 'email', 'admin@barbergo.com'), 'email', now(), now(), now()),
  ('b0000000-0000-0000-0000-000000000000', 'b0000000-0000-0000-0000-000000000000', jsonb_build_object('sub', 'b0000000-0000-0000-0000-000000000000', 'email', 'joao@barbergo.com'), 'email', now(), now(), now()),
  ('c0000000-0000-0000-0000-000000000000', 'c0000000-0000-0000-0000-000000000000', jsonb_build_object('sub', 'c0000000-0000-0000-0000-000000000000', 'email', 'pedro@barbergo.com'), 'email', now(), now(), now()),
  ('d0000000-0000-0000-0000-000000000000', 'd0000000-0000-0000-0000-000000000000', jsonb_build_object('sub', 'd0000000-0000-0000-0000-000000000000', 'email', 'maria@barbergo.com'), 'email', now(), now(), now()),
  ('e0000000-0000-0000-0000-000000000000', 'e0000000-0000-0000-0000-000000000000', jsonb_build_object('sub', 'e0000000-0000-0000-0000-000000000000', 'email', 'carlos@barbergo.com'), 'email', now(), now(), now())
on conflict (id, provider) do nothing;


-- Nota: Os triggers 'on_auth_user_created' já criaram automaticamente
-- as linhas correspondentes em 'usuarios', 'prestadores' e 'consumidores'.

-- Atualizar dados detalhados dos prestadores cadastrados via trigger
update prestadores
set descricao = 'Barbeiro especialista em cortes clássicos e design de barba.',
    especialidade = 'Cortes Clássicos e Barba',
    endereco = 'Av. Dom Luís, 500 - Aldeota',
    cidade = 'Fortaleza - CE',
    avaliacao_media = 4.8
where usuario_id = 'b0000000-0000-0000-0000-000000000000';

update prestadores
set descricao = 'Estilista capilar focado em degradê moderno, pigmentação e estética jovem.',
    especialidade = 'Degradê e Pigmentação',
    endereco = 'Av. Washington Soares, 1500 - Edson Queiroz',
    cidade = 'Fortaleza - CE',
    avaliacao_media = 4.9
where usuario_id = 'c0000000-0000-0000-0000-000000000000';

-- Cadastrar serviços para os prestadores
insert into servicos (prestador_id, nome, descricao, preco, duracao_minutos) values
  ((select id from prestadores where usuario_id = 'b0000000-0000-0000-0000-000000000000'), 'Corte clássico', 'Corte de cabelo tesoura e máquina com lavagem', 40.00, 40),
  ((select id from prestadores where usuario_id = 'b0000000-0000-0000-0000-000000000000'), 'Barba Completa', 'Barba feita na navalha com toalha quente', 30.00, 30),
  ((select id from prestadores where usuario_id = 'b0000000-0000-0000-0000-000000000000'), 'Combo Corte + Barba', 'Combo completo promocional', 60.00, 70),
  ((select id from prestadores where usuario_id = 'c0000000-0000-0000-0000-000000000000'), 'Degradê Navalhado', 'Corte com transição limpa na navalha', 45.00, 45),
  ((select id from prestadores where usuario_id = 'c0000000-0000-0000-0000-000000000000'), 'Pigmentação', 'Pigmentação para disfarçar imperfeições e realçar o corte', 25.00, 20);

-- Cadastrar horários na agenda para os próximos 7 dias (exemplo simples)
-- João
insert into agenda (prestador_id, data, hora_inicio, hora_fim, disponivel)
select
  p.id,
  d.data,
  h.inicio::time,
  h.fim::time,
  true
from prestadores p
cross join (
  select (current_date + i * interval '1 day')::date as data
  from generate_series(0, 6) i
) d
cross join (values
  ('09:00:00', '09:45:00'),
  ('10:00:00', '10:45:00'),
  ('11:00:00', '11:45:00'),
  ('14:00:00', '14:45:00'),
  ('15:00:00', '15:45:00'),
  ('16:00:00', '16:45:00')
) as h(inicio, fim)
where p.usuario_id = 'b0000000-0000-0000-0000-000000000000'
on conflict do nothing;

-- Pedro
insert into agenda (prestador_id, data, hora_inicio, hora_fim, disponivel)
select
  p.id,
  d.data,
  h.inicio::time,
  h.fim::time,
  true
from prestadores p
cross join (
  select (current_date + i * interval '1 day')::date as data
  from generate_series(0, 6) i
) d
cross join (values
  ('09:00:00', '09:45:00'),
  ('10:00:00', '10:45:00'),
  ('13:00:00', '13:45:00'),
  ('14:00:00', '14:45:00'),
  ('16:00:00', '16:45:00'),
  ('17:00:00', '17:45:00')
) as h(inicio, fim)
where p.usuario_id = 'c0000000-0000-0000-0000-000000000000'
on conflict do nothing;

-- Cadastrar anúncios
insert into anuncios (prestador_id, titulo, descricao, ativo) values
  ((select id from prestadores where usuario_id = 'b0000000-0000-0000-0000-000000000000'), 'Desconto de Inauguração', 'Ganhe 15% de desconto em qualquer agendamento nesta semana.', true),
  ((select id from prestadores where usuario_id = 'c0000000-0000-0000-0000-000000000000'), 'Combo Degradê + Barba + Pigmentação', 'Combo premium completo por apenas R$ 75,00.', true);

-- Cadastrar avaliações de exemplo
insert into avaliacoes (consumidor_id, prestador_id, nota, comentario) values
  (
    (select id from consumidores where usuario_id = 'd0000000-0000-0000-0000-000000000000'),
    (select id from prestadores where usuario_id = 'b0000000-0000-0000-0000-000000000000'),
    5,
    'Atendimento incrível! João é extremamente técnico e profissional.'
  ),
  (
    (select id from consumidores where usuario_id = 'e0000000-0000-0000-0000-000000000000'),
    (select id from prestadores where usuario_id = 'c0000000-0000-0000-0000-000000000000'),
    4,
    'Degradê ficou impecável. Voltarei com certeza.'
  );
