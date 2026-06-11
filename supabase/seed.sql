-- ============================================================
-- BarberGo — Seed (dados de demonstração)
-- Crie os usuários abaixo via Supabase Auth Dashboard antes.
-- O trigger handle_new_user() criará os registros em 'usuarios'.
-- Após criar os usuários, execute este SQL.
-- ============================================================
-- Usuários para criar no Auth (senha: 123456):
--   admin@barbergo.com     (tipo: admin)
--   joao@barbergo.com      (tipo: prestador)
--   pedro@barbergo.com     (tipo: prestador)
--   maria@barbergo.com     (tipo: consumidor)
--   carlos@barbergo.com    (tipo: consumidor)
-- ============================================================

-- Após criar os usuários e obter os UUIDs, descomente abaixo:

/*
-- Prestadores
INSERT INTO prestadores (usuario_id, descricao, especialidade, endereco, cidade, avaliacao_media, ativo) VALUES
  ('<UUID_JOAO>', 'Barbeiro profissional com 10 anos de experiência em cortes modernos e clássicos.', 'Corte e Barba', 'Rua das Flores, 452', 'Fortaleza - CE', 4.8, true),
  ('<UUID_PEDRO>', 'Especialista em degradê e barba desenhada. Atendimento premium.', 'Degradê e Barba', 'Av. Central, 1250', 'Fortaleza - CE', 4.9, true);

-- Consumidores
INSERT INTO consumidores (usuario_id) VALUES
  ('<UUID_MARIA>'),
  ('<UUID_CARLOS>');

-- Serviços
INSERT INTO servicos (prestador_id, nome, descricao, preco, duracao_minutos, ativo)
SELECT p.id, s.nome, s.descricao, s.preco, s.duracao, true
FROM prestadores p
CROSS JOIN (VALUES
  ('Corte Masculino', 'Corte clássico com acabamento e finalização.', 35, 45),
  ('Barba Completa', 'Barba com toalha quente, hidratação e navalha.', 30, 35),
  ('Corte + Barba', 'Combo completo com acabamento premium.', 60, 75),
  ('Sobrancelha', 'Design e limpeza de sobrancelha.', 15, 20)
) AS s(nome, descricao, preco, duracao);

-- Agenda (próximos 7 dias, horários das 09 às 18)
INSERT INTO agenda (prestador_id, data, hora_inicio, hora_fim, disponivel)
SELECT p.id, d.data, h.inicio, h.fim, true
FROM prestadores p
CROSS JOIN generate_series(current_date, current_date + interval '6 days', interval '1 day') AS d(data)
CROSS JOIN (VALUES
  ('09:00', '09:45'), ('10:00', '10:45'), ('11:00', '11:45'),
  ('13:00', '13:45'), ('14:00', '14:45'), ('15:00', '15:45'),
  ('16:00', '16:45'), ('17:00', '17:45')
) AS h(inicio, fim)
WHERE extract(dow from d.data) between 1 and 6;

-- Anúncios
INSERT INTO anuncios (prestador_id, titulo, descricao, ativo)
SELECT p.id, a.titulo, a.descricao, true
FROM prestadores p
CROSS JOIN (VALUES
  ('Promoção Corte + Barba', 'Corte e barba por apenas R$ 50 esta semana!'),
  ('Novo Horário', 'Agora atendemos aos sábados das 08h às 15h.')
) AS a(titulo, descricao);
*/
