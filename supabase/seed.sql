-- ============================================================
-- BarberGo — Seed SQL (Dados de Demonstração)
-- Versão: 3.0 — Compatível com Supabase Auth e Enums V2
-- ============================================================
-- Execute APÓS o schema.sql
-- ============================================================

-- ============================================================
-- 1. LIMPAR DADOS ANTERIORES
-- ============================================================

delete from auth.users where email in (
  'admin@barbergo.com',
  'joao@barbergo.com',
  'pedro@barbergo.com',
  'maria@barbergo.com',
  'carlos@barbergo.com'
);

-- ============================================================
-- 2. INSERIR USUÁRIOS NO AUTH (Supabase)
-- ============================================================
-- Senha padrão para todos: 123456
-- Hash bcrypt: $2a$10$wE4j7n6gOEqH1aP8uM9XWutN/vpxG2P0HmWl19cK6zZf9YhS2p2/W
-- UUIDs no formato v4 válido

insert into auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, is_super_admin, role, aud, created_at, updated_at
) values
  -- Admin
  ('a0000000-0000-4000-8000-000000000000', '00000000-0000-0000-0000-000000000000',
   'admin@barbergo.com',
   '$2a$10$rO8il4uLBnH8wsaDeOZZOeQyTZOIc64h3NGGc3Xbw0UUKJEp7ez8y',
   now(),
   '{"provider":"email","providers":["email"]}',
   '{"nome":"Gerente Admin","tipo_usuario":"admin"}',
   false, 'authenticated', 'authenticated', now(), now()),

  -- Prestador 1 (João Barbeiro)
  ('b0000000-0000-4000-8000-000000000000', '00000000-0000-0000-0000-000000000000',
   'joao@barbergo.com',
   '$2a$10$rO8il4uLBnH8wsaDeOZZOeQyTZOIc64h3NGGc3Xbw0UUKJEp7ez8y',
   now(),
   '{"provider":"email","providers":["email"]}',
   '{"nome":"João Barbeiro","tipo_usuario":"prestador","telefone":"(85) 99999-1111"}',
   false, 'authenticated', 'authenticated', now(), now()),

  -- Prestador 2 (Pedro Navalha)
  ('c0000000-0000-4000-8000-000000000000', '00000000-0000-0000-0000-000000000000',
   'pedro@barbergo.com',
   '$2a$10$rO8il4uLBnH8wsaDeOZZOeQyTZOIc64h3NGGc3Xbw0UUKJEp7ez8y',
   now(),
   '{"provider":"email","providers":["email"]}',
   '{"nome":"Pedro Navalha","tipo_usuario":"prestador","telefone":"(85) 99999-2222"}',
   false, 'authenticated', 'authenticated', now(), now()),

  -- Consumidor 1 (Maria Silva)
  ('d0000000-0000-4000-8000-000000000000', '00000000-0000-0000-0000-000000000000',
   'maria@barbergo.com',
   '$2a$10$rO8il4uLBnH8wsaDeOZZOeQyTZOIc64h3NGGc3Xbw0UUKJEp7ez8y',
   now(),
   '{"provider":"email","providers":["email"]}',
   '{"nome":"Maria Silva","tipo_usuario":"consumidor","telefone":"(85) 98888-3333"}',
   false, 'authenticated', 'authenticated', now(), now()),

  -- Consumidor 2 (Carlos Souza)
  ('e0000000-0000-4000-8000-000000000000', '00000000-0000-0000-0000-000000000000',
   'carlos@barbergo.com',
   '$2a$10$rO8il4uLBnH8wsaDeOZZOeQyTZOIc64h3NGGc3Xbw0UUKJEp7ez8y',
   now(),
   '{"provider":"email","providers":["email"]}',
   '{"nome":"Carlos Souza","tipo_usuario":"consumidor","telefone":"(85) 98888-4444"}',
   false, 'authenticated', 'authenticated', now(), now());

-- ============================================================
-- CORREÇÃO DO SCHEMA CACHE DO GOTRUE (Supabase Auth)
-- ============================================================
-- Garante que o GoTrue consiga ler os usuários sem dar erro 500
update auth.users
set confirmation_token = '',
    recovery_token = '',
    email_change_token_new = '',
    email_change_token_current = '',
    email_change = '',
    phone_change_token = '',
    reauthentication_token = ''
where email in (
  'admin@barbergo.com',
  'joao@barbergo.com',
  'pedro@barbergo.com',
  'maria@barbergo.com',
  'carlos@barbergo.com'
);

-- ============================================================
-- 3. VINCULAR IDENTIDADES DE LOGIN
-- ============================================================

insert into auth.identities (
  id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, provider_id
) values
  ('a0000000-0000-4000-8000-000000000000', 'a0000000-0000-4000-8000-000000000000',
   jsonb_build_object('sub', 'a0000000-0000-4000-8000-000000000000', 'email', 'admin@barbergo.com'),
   'email', now(), now(), now(), 'a0000000-0000-4000-8000-000000000000'),

  ('b0000000-0000-4000-8000-000000000000', 'b0000000-0000-4000-8000-000000000000',
   jsonb_build_object('sub', 'b0000000-0000-4000-8000-000000000000', 'email', 'joao@barbergo.com'),
   'email', now(), now(), now(), 'b0000000-0000-4000-8000-000000000000'),

  ('c0000000-0000-4000-8000-000000000000', 'c0000000-0000-4000-8000-000000000000',
   jsonb_build_object('sub', 'c0000000-0000-4000-8000-000000000000', 'email', 'pedro@barbergo.com'),
   'email', now(), now(), now(), 'c0000000-0000-4000-8000-000000000000'),

  ('d0000000-0000-4000-8000-000000000000', 'd0000000-0000-4000-8000-000000000000',
   jsonb_build_object('sub', 'd0000000-0000-4000-8000-000000000000', 'email', 'maria@barbergo.com'),
   'email', now(), now(), now(), 'd0000000-0000-4000-8000-000000000000'),

  ('e0000000-0000-4000-8000-000000000000', 'e0000000-0000-4000-8000-000000000000',
   jsonb_build_object('sub', 'e0000000-0000-4000-8000-000000000000', 'email', 'carlos@barbergo.com'),
   'email', now(), now(), now(), 'e0000000-0000-4000-8000-000000000000');

-- ============================================================
-- 4. ATUALIZAR DADOS DOS PRESTADORES (criados via trigger)
-- ============================================================

-- João Barbeiro
update prestadores
set descricao       = 'Barbeiro especialista em cortes clássicos e design de barba. Mais de 10 anos de experiência.',
    especialidade   = 'Cortes Clássicos e Barba',
    endereco        = 'Av. Dom Luís, 500 - Aldeota',
    cidade          = 'Fortaleza',
    estado          = 'CE',
    cep             = '60160-230',
    avaliacao_media = 4.8
where usuario_id = 'b0000000-0000-4000-8000-000000000000';

-- Pedro Navalha
update prestadores
set descricao       = 'Estilista capilar focado em degradê moderno, pigmentação e estética jovem.',
    especialidade   = 'Degradê e Pigmentação',
    endereco        = 'Av. Washington Soares, 1500 - Edson Queiroz',
    cidade          = 'Fortaleza',
    estado          = 'CE',
    cep             = '60811-341',
    avaliacao_media = 4.9
where usuario_id = 'c0000000-0000-4000-8000-000000000000';

-- ============================================================
-- 5. SERVIÇOS (10 serviços)
-- ============================================================

insert into servicos (prestador_id, nome, descricao, preco, duracao_minutos) values
  -- João (5 serviços)
  ((select id from prestadores where usuario_id = 'b0000000-0000-4000-8000-000000000000'),
   'Corte Masculino', 'Corte completo com tesoura e máquina, inclui lavagem', 40.00, 40),
  ((select id from prestadores where usuario_id = 'b0000000-0000-4000-8000-000000000000'),
   'Barba Completa', 'Barba feita na navalha com toalha quente e hidratação', 30.00, 30),
  ((select id from prestadores where usuario_id = 'b0000000-0000-4000-8000-000000000000'),
   'Combo Corte + Barba', 'Combo completo promocional com lavagem', 60.00, 70),
  ((select id from prestadores where usuario_id = 'b0000000-0000-4000-8000-000000000000'),
   'Corte Infantil', 'Corte especial para crianças até 12 anos', 30.00, 30),
  ((select id from prestadores where usuario_id = 'b0000000-0000-4000-8000-000000000000'),
   'Sobrancelha', 'Design e limpeza de sobrancelha masculina', 15.00, 15),

  -- Pedro (5 serviços)
  ((select id from prestadores where usuario_id = 'c0000000-0000-4000-8000-000000000000'),
   'Degradê Navalhado', 'Corte com transição limpa na navalha', 45.00, 45),
  ((select id from prestadores where usuario_id = 'c0000000-0000-4000-8000-000000000000'),
   'Pigmentação', 'Pigmentação para disfarçar imperfeições e realçar o corte', 25.00, 20),
  ((select id from prestadores where usuario_id = 'c0000000-0000-4000-8000-000000000000'),
   'Hidratação Capilar', 'Tratamento intensivo com cremes profissionais', 35.00, 30),
  ((select id from prestadores where usuario_id = 'c0000000-0000-4000-8000-000000000000'),
   'Combo Degradê + Barba', 'Degradê completo + barba na navalha', 65.00, 60),
  ((select id from prestadores where usuario_id = 'c0000000-0000-4000-8000-000000000000'),
   'Luzes Masculinas', 'Mechas e luzes para cabelo masculino', 80.00, 90);

-- ============================================================
-- 6. AGENDA (20 horários - 10 por prestador, próximos 5 dias)
-- ============================================================

-- João — 10 horários
insert into agenda (prestador_id, data, hora_inicio, hora_fim, disponivel)
select
  p.id,
  d.dia,
  h.inicio::time,
  h.fim::time,
  true
from prestadores p
cross join (
  select (current_date + i)::date as dia
  from generate_series(1, 5) i
) d
cross join (values
  ('09:00:00', '09:45:00'),
  ('10:00:00', '10:45:00')
) as h(inicio, fim)
where p.usuario_id = 'b0000000-0000-4000-8000-000000000000'
on conflict do nothing;

-- Pedro — 10 horários
insert into agenda (prestador_id, data, hora_inicio, hora_fim, disponivel)
select
  p.id,
  d.dia,
  h.inicio::time,
  h.fim::time,
  true
from prestadores p
cross join (
  select (current_date + i)::date as dia
  from generate_series(1, 5) i
) d
cross join (values
  ('14:00:00', '14:45:00'),
  ('15:00:00', '15:45:00')
) as h(inicio, fim)
where p.usuario_id = 'c0000000-0000-4000-8000-000000000000'
on conflict do nothing;

-- ============================================================
-- 7. AGENDAMENTOS + 8. PAGAMENTOS PIX (bloco PL/pgSQL)
-- ============================================================

do $$
declare
  v_consumidor_maria uuid;
  v_consumidor_carlos uuid;
  v_prestador_joao uuid;
  v_prestador_pedro uuid;
  v_servico_corte uuid;
  v_servico_barba uuid;
  v_servico_combo uuid;
  v_servico_degrade uuid;
  v_servico_pigmentacao uuid;
  v_agenda_joao_1 uuid;
  v_agenda_joao_2 uuid;
  v_agenda_pedro_1 uuid;
  v_agenda_pedro_2 uuid;
  v_agendamento_1 uuid;
  v_agendamento_2 uuid;
  v_agendamento_3 uuid;
  v_agendamento_4 uuid;
  v_agendamento_5 uuid;
begin
  select id into v_consumidor_maria from consumidores where usuario_id = 'd0000000-0000-4000-8000-000000000000';
  select id into v_consumidor_carlos from consumidores where usuario_id = 'e0000000-0000-4000-8000-000000000000';
  select id into v_prestador_joao from prestadores where usuario_id = 'b0000000-0000-4000-8000-000000000000';
  select id into v_prestador_pedro from prestadores where usuario_id = 'c0000000-0000-4000-8000-000000000000';

  select id into v_servico_corte from servicos where prestador_id = v_prestador_joao and nome = 'Corte Masculino' limit 1;
  select id into v_servico_barba from servicos where prestador_id = v_prestador_joao and nome = 'Barba Completa' limit 1;
  select id into v_servico_combo from servicos where prestador_id = v_prestador_joao and nome = 'Combo Corte + Barba' limit 1;
  select id into v_servico_degrade from servicos where prestador_id = v_prestador_pedro and nome = 'Degradê Navalhado' limit 1;
  select id into v_servico_pigmentacao from servicos where prestador_id = v_prestador_pedro and nome = 'Pigmentação' limit 1;

  select id into v_agenda_joao_1 from agenda where prestador_id = v_prestador_joao and disponivel = true order by data, hora_inicio limit 1;
  select id into v_agenda_joao_2 from agenda where prestador_id = v_prestador_joao and disponivel = true and id != v_agenda_joao_1 order by data, hora_inicio limit 1;
  select id into v_agenda_pedro_1 from agenda where prestador_id = v_prestador_pedro and disponivel = true order by data, hora_inicio limit 1;
  select id into v_agenda_pedro_2 from agenda where prestador_id = v_prestador_pedro and disponivel = true and id != v_agenda_pedro_1 order by data, hora_inicio limit 1;

  -- Agendamento 1: Maria -> João (Corte) — Concluído
  insert into agendamentos (consumidor_id, prestador_id, servico_id, agenda_id, valor_total, status, observacoes)
  values (v_consumidor_maria, v_prestador_joao, v_servico_corte, v_agenda_joao_1, 40.00, 'concluido', 'Primeira visita, corte simples')
  returning id into v_agendamento_1;

  -- Agendamento 2: Maria -> Pedro (Degradê) — Pago
  insert into agendamentos (consumidor_id, prestador_id, servico_id, agenda_id, valor_total, status, observacoes)
  values (v_consumidor_maria, v_prestador_pedro, v_servico_degrade, v_agenda_pedro_1, 45.00, 'pago', null)
  returning id into v_agendamento_2;

  -- Agendamento 3: Carlos -> João (Combo) — Pendente
  insert into agendamentos (consumidor_id, prestador_id, servico_id, agenda_id, valor_total, status, observacoes)
  values (v_consumidor_carlos, v_prestador_joao, v_servico_combo, v_agenda_joao_2, 60.00, 'pendente', 'Gostaria de corte social')
  returning id into v_agendamento_3;

  -- Agendamento 4: Carlos -> Pedro (Pigmentação) — Pago (antigo confirmado)
  insert into agendamentos (consumidor_id, prestador_id, servico_id, agenda_id, valor_total, status, observacoes)
  values (v_consumidor_carlos, v_prestador_pedro, v_servico_pigmentacao, v_agenda_pedro_2, 25.00, 'pago', null)
  returning id into v_agendamento_4;

  -- Agendamento 5: Maria -> João (Barba) — Cancelado
  insert into agendamentos (consumidor_id, prestador_id, servico_id, agenda_id, valor_total, status, observacoes)
  values (v_consumidor_maria, v_prestador_joao, v_servico_barba, null, 30.00, 'cancelado', 'Não pude comparecer')
  returning id into v_agendamento_5;

  update agenda set disponivel = false where id in (v_agenda_joao_1, v_agenda_joao_2, v_agenda_pedro_1, v_agenda_pedro_2);

  -- Pagamentos PIX (5)
  insert into pagamentos (agendamento_id, mercado_pago_payment_id, external_reference, valor, status)
  values
    (v_agendamento_1, 'MP-PAY-100001', 'BARBERGO-AG-001', 40.00, 'aprovado'),
    (v_agendamento_2, 'MP-PAY-100002', 'BARBERGO-AG-002', 45.00, 'aprovado'),
    (v_agendamento_3, null,             'BARBERGO-AG-003', 60.00, 'pendente'),
    (v_agendamento_4, 'MP-PAY-100004', 'BARBERGO-AG-004', 25.00, 'aprovado'),
    (v_agendamento_5, 'MP-PAY-100005', 'BARBERGO-AG-005', 30.00, 'estornado');
end $$;

-- ============================================================
-- 9. PRODUTOS (10 produtos)
-- ============================================================

insert into produtos (prestador_id, nome, descricao, preco, estoque, ativo) values
  ((select id from prestadores where usuario_id = 'b0000000-0000-4000-8000-000000000000'),
   'Pomada Modeladora', 'Pomada efeito seco para modelagem duradoura', 45.00, 25, true),
  ((select id from prestadores where usuario_id = 'b0000000-0000-4000-8000-000000000000'),
   'Gel Fixador Forte', 'Gel de fixação extra forte com brilho', 28.00, 30, true),
  ((select id from prestadores where usuario_id = 'b0000000-0000-4000-8000-000000000000'),
   'Shampoo Premium', 'Shampoo anticaspa com extrato de menta', 35.00, 20, true),
  ((select id from prestadores where usuario_id = 'b0000000-0000-4000-8000-000000000000'),
   'Óleo para Barba', 'Óleo hidratante com aroma amadeirado', 55.00, 15, true),
  ((select id from prestadores where usuario_id = 'b0000000-0000-4000-8000-000000000000'),
   'Cera Modeladora', 'Cera de fixação média com acabamento natural', 38.00, 18, true),
  ((select id from prestadores where usuario_id = 'c0000000-0000-4000-8000-000000000000'),
   'Escova Profissional', 'Escova térmica para alisamento rápido', 65.00, 10, true),
  ((select id from prestadores where usuario_id = 'c0000000-0000-4000-8000-000000000000'),
   'Spray Fixador', 'Spray de fixação leve e invisível', 22.00, 35, true),
  ((select id from prestadores where usuario_id = 'c0000000-0000-4000-8000-000000000000'),
   'Condicionador Profissional', 'Condicionador com queratina para cabelos danificados', 42.00, 12, true),
  ((select id from prestadores where usuario_id = 'c0000000-0000-4000-8000-000000000000'),
   'Kit Barba Completo', 'Kit com óleo, balm e pente para barba', 89.00, 8, true),
  ((select id from prestadores where usuario_id = 'c0000000-0000-4000-8000-000000000000'),
   'Máscara Capilar', 'Máscara de reconstrução profunda 300ml', 48.00, 14, true);

-- ============================================================
-- 10. PEDIDOS DE PRODUTOS (5 pedidos) + PAGAMENTOS
-- ============================================================

do $$
declare
  v_consumidor_maria uuid;
  v_consumidor_carlos uuid;
  v_produto_pomada uuid;
  v_produto_gel uuid;
  v_produto_shampoo uuid;
  v_produto_oleo uuid;
  v_produto_escova uuid;
  v_produto_spray uuid;
  v_produto_kit uuid;
  v_pedido_1 uuid;
  v_pedido_2 uuid;
  v_pedido_3 uuid;
  v_pedido_4 uuid;
  v_pedido_5 uuid;
begin
  select id into v_consumidor_maria from consumidores where usuario_id = 'd0000000-0000-4000-8000-000000000000';
  select id into v_consumidor_carlos from consumidores where usuario_id = 'e0000000-0000-4000-8000-000000000000';

  select id into v_produto_pomada from produtos where nome = 'Pomada Modeladora' limit 1;
  select id into v_produto_gel from produtos where nome = 'Gel Fixador Forte' limit 1;
  select id into v_produto_shampoo from produtos where nome = 'Shampoo Premium' limit 1;
  select id into v_produto_oleo from produtos where nome = 'Óleo para Barba' limit 1;
  select id into v_produto_escova from produtos where nome = 'Escova Profissional' limit 1;
  select id into v_produto_spray from produtos where nome = 'Spray Fixador' limit 1;
  select id into v_produto_kit from produtos where nome = 'Kit Barba Completo' limit 1;

  -- Pedido 1: Maria compra Pomada + Gel — Pago
  insert into pedidos (consumidor_id, valor_total, status)
  values (v_consumidor_maria, 73.00, 'pago') returning id into v_pedido_1;
  insert into pedido_itens (pedido_id, produto_id, quantidade, preco_unitario) values
    (v_pedido_1, v_produto_pomada, 1, 45.00),
    (v_pedido_1, v_produto_gel, 1, 28.00);

  -- Pedido 2: Carlos compra Óleo + Shampoo — Enviado
  insert into pedidos (consumidor_id, valor_total, status)
  values (v_consumidor_carlos, 90.00, 'enviado') returning id into v_pedido_2;
  insert into pedido_itens (pedido_id, produto_id, quantidade, preco_unitario) values
    (v_pedido_2, v_produto_oleo, 1, 55.00),
    (v_pedido_2, v_produto_shampoo, 1, 35.00);

  -- Pedido 3: Maria compra Escova — Entregue
  insert into pedidos (consumidor_id, valor_total, status)
  values (v_consumidor_maria, 65.00, 'entregue') returning id into v_pedido_3;
  insert into pedido_itens (pedido_id, produto_id, quantidade, preco_unitario) values
    (v_pedido_3, v_produto_escova, 1, 65.00);

  -- Pedido 4: Carlos compra Kit Barba + Spray — Aguardando Pagamento
  insert into pedidos (consumidor_id, valor_total, status)
  values (v_consumidor_carlos, 111.00, 'aguardando_pagamento') returning id into v_pedido_4;
  insert into pedido_itens (pedido_id, produto_id, quantidade, preco_unitario) values
    (v_pedido_4, v_produto_kit, 1, 89.00),
    (v_pedido_4, v_produto_spray, 1, 22.00);

  -- Pedido 5: Maria compra 2x Gel — Cancelado
  insert into pedidos (consumidor_id, valor_total, status)
  values (v_consumidor_maria, 56.00, 'cancelado') returning id into v_pedido_5;
  insert into pedido_itens (pedido_id, produto_id, quantidade, preco_unitario) values
    (v_pedido_5, v_produto_gel, 2, 28.00);

  -- Pagamentos de Produtos (para pedidos pagos/enviados/entregues)
  insert into pagamentos_produtos (pedido_id, mercado_pago_payment_id, external_reference, valor, status)
  values
    (v_pedido_1, 'MP-PROD-200001', 'BARBERGO-PD-001', 73.00, 'aprovado'),
    (v_pedido_2, 'MP-PROD-200002', 'BARBERGO-PD-002', 90.00, 'aprovado'),
    (v_pedido_3, 'MP-PROD-200003', 'BARBERGO-PD-003', 65.00, 'aprovado'),
    (v_pedido_4, null,              'BARBERGO-PD-004', 111.00, 'pendente');
end $$;

-- ============================================================
-- 11. ANÚNCIOS
-- ============================================================

insert into anuncios (prestador_id, titulo, descricao, ativo) values
  ((select id from prestadores where usuario_id = 'b0000000-0000-4000-8000-000000000000'),
   'Desconto de Inauguração', 'Ganhe 15% de desconto em qualquer agendamento nesta semana. Aproveite!', true),
  ((select id from prestadores where usuario_id = 'c0000000-0000-4000-8000-000000000000'),
   'Combo Degradê + Barba + Pigmentação', 'Combo premium completo por apenas R$ 75,00. Oferta limitada!', true);

-- ============================================================
-- 12. AVALIAÇÕES (5 avaliações — trigger atualiza média)
-- ============================================================

insert into avaliacoes (consumidor_id, prestador_id, nota, comentario) values
  ((select id from consumidores where usuario_id = 'd0000000-0000-4000-8000-000000000000'),
   (select id from prestadores where usuario_id = 'b0000000-0000-4000-8000-000000000000'),
   5, 'Atendimento incrível! João é extremamente técnico e profissional.'),
  ((select id from consumidores where usuario_id = 'e0000000-0000-4000-8000-000000000000'),
   (select id from prestadores where usuario_id = 'c0000000-0000-4000-8000-000000000000'),
   4, 'Degradê ficou impecável. Voltarei com certeza.'),
  ((select id from consumidores where usuario_id = 'd0000000-0000-4000-8000-000000000000'),
   (select id from prestadores where usuario_id = 'c0000000-0000-4000-8000-000000000000'),
   5, 'Pedro é um artista! Pigmentação perfeita.'),
  ((select id from consumidores where usuario_id = 'e0000000-0000-4000-8000-000000000000'),
   (select id from prestadores where usuario_id = 'b0000000-0000-4000-8000-000000000000'),
   4, 'Corte muito bom, ambiente agradável. Recomendo.'),
  ((select id from consumidores where usuario_id = 'd0000000-0000-4000-8000-000000000000'),
   (select id from prestadores where usuario_id = 'b0000000-0000-4000-8000-000000000000'),
   5, 'Combo corte + barba excelente! Saí de lá outro homem.');

-- ============================================================
-- 13. FAVORITOS
-- ============================================================

insert into favoritos (consumidor_id, prestador_id) values
  ((select id from consumidores where usuario_id = 'd0000000-0000-4000-8000-000000000000'),
   (select id from prestadores where usuario_id = 'b0000000-0000-4000-8000-000000000000')),
  ((select id from consumidores where usuario_id = 'e0000000-0000-4000-8000-000000000000'),
   (select id from prestadores where usuario_id = 'c0000000-0000-4000-8000-000000000000')),
  ((select id from consumidores where usuario_id = 'd0000000-0000-4000-8000-000000000000'),
   (select id from prestadores where usuario_id = 'c0000000-0000-4000-8000-000000000000'));

-- ============================================================
-- FIM DO SEED
-- ============================================================
