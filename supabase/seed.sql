-- ============================================================
-- BarberGo — Seed de dados de demonstração
-- ============================================================
-- IMPORTANTE: Os usuários devem ser criados via Supabase Auth
-- (Dashboard > Authentication > Users > Add User) ou via API.
--
-- Após criar os usuários no Auth, copie os UUIDs gerados e
-- substitua os placeholders abaixo.
--
-- Usuários sugeridos para criação (senha padrão: 123456):
--   admin@barbergo.com        (perfil: ADMIN)
--   carlos@barbergo.com       (perfil: CONTRATANTE)
--   joao@barbergo.com         (perfil: CONTRATANTE)
--   responsavel1@barbergo.com (perfil: PRESTADOR_PJ)
--   responsavel2@barbergo.com (perfil: PRESTADOR_PJ)
--   responsavel3@barbergo.com (perfil: PRESTADOR_PJ)
--   responsavel4@barbergo.com (perfil: PRESTADOR_PJ)
--   barbeiro1@barbergo.com    (perfil: PRESTADOR_PF)
--   barbeiro2@barbergo.com    (perfil: PRESTADOR_PF)
--   barbeiro3@barbergo.com    (perfil: PRESTADOR_PF)
--   barbeiro4@barbergo.com    (perfil: PRESTADOR_PF)
--
-- O trigger handle_new_user() criará automaticamente os profiles.
-- Após os profiles existirem, execute o SQL abaixo.
-- ============================================================

-- Exemplo com UUIDs placeholder — substitua pelos reais!
-- Para facilitar em ambiente de dev, você pode usar o supabase-admin
-- para criar os usuários programaticamente.

-- Limpar dados existentes (manter profiles, pois são gerenciados pelo Auth)
truncate table avaliacoes cascade;
truncate table agendamentos cascade;
truncate table disponibilidades cascade;
truncate table servicos cascade;
truncate table fotos cascade;
truncate table favoritos cascade;
truncate table barbeiros cascade;
truncate table barbearias cascade;

-- ============================================================
-- Após criar os usuários via Auth e obter os UUIDs, descomente
-- e adapte o bloco abaixo:
-- ============================================================

/*
-- Variáveis para os UUIDs (substitua pelos valores reais)
-- Dica: no SQL Editor do Supabase, use:
--   SELECT id, email FROM auth.users ORDER BY created_at;

-- Barbearias
INSERT INTO barbearias (nome, descricao, endereco, telefone, bairro, cidade, avaliacao_media, destaque, responsavel_id)
VALUES
  ('Vilar Barber Club', 'Barbearia premium com ambiente moderno e atendimento de excelência.', 'Rua das Flores, 452', '(85) 3333-1001', 'Praia de Iracema', 'Fortaleza - CE', 4.8, true, '<UUID_RESPONSAVEL_1>'),
  ('Barbearia Centro', 'Referência em cortes clássicos e barba alinhada no coração de Fortaleza.', 'Av. Central, 1250', '(85) 3333-1002', 'Centro', 'Fortaleza - CE', 4.9, true, '<UUID_RESPONSAVEL_2>'),
  ('Navalha Prime', 'Especialista em acabamento preciso com profissionais de experiência.', 'Rua Augusta, 789', '(85) 3333-1003', 'Aldeota', 'Fortaleza - CE', 4.7, true, '<UUID_RESPONSAVEL_3>'),
  ('Corte Nobre', 'Excelência em barbearia com atendimento personalizado e diferenciado.', 'Av. Beira Mar, 2000', '(85) 3333-1004', 'Barra do Ceará', 'Fortaleza - CE', 4.6, true, '<UUID_RESPONSAVEL_4>');

-- Barbeiros (para cada barbearia, 2 barbeiros)
INSERT INTO barbeiros (nome, especialidade, descricao, telefone, ativo, usuario_id, barbearia_id)
VALUES
  ('Rafael Silva', 'Corte masculino', 'Profissional experiente em corte masculino com excelentes avaliações.', '(85) 99999-0001', true, '<UUID_BARBEIRO_1>', (SELECT id FROM barbearias WHERE nome = 'Vilar Barber Club')),
  ('Lucas Andrade', 'Barba completa', 'Profissional experiente em barba completa com excelentes avaliações.', '(85) 99999-0002', true, '<UUID_BARBEIRO_2>', (SELECT id FROM barbearias WHERE nome = 'Vilar Barber Club')),
  ('Davi Martins', 'Corte masculino', 'Profissional experiente em corte masculino com excelentes avaliações.', '(85) 99999-0003', true, '<UUID_BARBEIRO_3>', (SELECT id FROM barbearias WHERE nome = 'Barbearia Centro')),
  ('Pedro Henrique', 'Barba completa', 'Profissional experiente em barba completa com excelentes avaliações.', '(85) 99999-0004', true, '<UUID_BARBEIRO_4>', (SELECT id FROM barbearias WHERE nome = 'Barbearia Centro'));

-- Disponibilidades para todos os barbeiros
INSERT INTO disponibilidades (barbeiro_id, dia_semana, hora_inicio, hora_fim)
SELECT b.id, dia.nome, '09:00', '18:00'
FROM barbeiros b
CROSS JOIN (
  VALUES ('SEGUNDA'), ('TERCA'), ('QUARTA'), ('QUINTA'), ('SEXTA')
) AS dia(nome);

INSERT INTO disponibilidades (barbeiro_id, dia_semana, hora_inicio, hora_fim)
SELECT b.id, 'SABADO', '08:00', '15:00'
FROM barbeiros b;

-- Serviços para cada barbearia
INSERT INTO servicos (nome, descricao, preco, duracao_minutos, ativo, barbearia_id)
SELECT s.nome, s.descricao, s.preco, s.duracao, true, b.id
FROM barbearias b
CROSS JOIN (
  VALUES
    ('Corte masculino', 'Corte clássico com acabamento e finalização.', 35, 45),
    ('Barba completa', 'Barba com toalha quente, hidratação e navalha.', 30, 35),
    ('Corte + Barba', 'Combo de corte e barba com acabamento premium.', 60, 75)
) AS s(nome, descricao, preco, duracao);
*/
