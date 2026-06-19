-- ====================================================================
-- BarberGo — Migration to contratacoes & status_contratacao
-- ====================================================================

-- 1. Add foto_url to public.prestadores
ALTER TABLE public.prestadores ADD COLUMN IF NOT EXISTS foto_url TEXT;

-- 2. Create enum type status_contratacao if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status_contratacao') THEN
    CREATE TYPE public.status_contratacao AS ENUM (
      'pendente',
      'confirmado',
      'recusado',
      'remarcacao_solicitada',
      'remarcado',
      'concluido',
      'cancelado'
    );
  END IF;
END
$$;

-- 3. Drop dependent views first (to allow renaming and type alterations)
DROP VIEW IF EXISTS public.vw_dashboard_admin CASCADE;
DROP VIEW IF EXISTS public.vw_agendamentos_detalhados CASCADE;
DROP VIEW IF EXISTS public.vw_prestadores_ranking CASCADE;
DROP VIEW IF EXISTS public.vw_contratacoes_detalhadas CASCADE;
DROP VIEW IF EXISTS public.vw_faturamento_prestador CASCADE;
DROP VIEW IF EXISTS public.vw_agenda_disponivel CASCADE;

-- 4. Rename agendamentos table to contratacoes (if it hasn't been renamed already)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'agendamentos') THEN
    ALTER TABLE public.agendamentos RENAME TO contratacoes;
  END IF;
END
$$;

-- 5. Convert status column of contratacoes to public.status_contratacao
ALTER TABLE public.contratacoes ALTER COLUMN status TYPE TEXT;
ALTER TABLE public.contratacoes ALTER COLUMN status SET DEFAULT 'pendente';

UPDATE public.contratacoes
SET status = CASE
  WHEN status = 'pago' THEN 'confirmado'
  WHEN status = 'aguardando_pagamento' THEN 'pendente'
  ELSE status
END
WHERE status::text NOT IN ('pendente', 'confirmado', 'recusado', 'remarcacao_solicitada', 'remarcado', 'concluido', 'cancelado');

ALTER TABLE public.contratacoes ALTER COLUMN status TYPE public.status_contratacao USING (status::public.status_contratacao);

-- 6. Rename column in public.pagamentos if agendamento_id exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'pagamentos' AND column_name = 'agendamento_id'
  ) THEN
    ALTER TABLE public.pagamentos RENAME COLUMN agendamento_id TO contratacao_id;
  END IF;
END
$$;

-- 7. Create public.historico_contratacoes table if not exists
CREATE TABLE IF NOT EXISTS public.historico_contratacoes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contratacao_id  UUID NOT NULL REFERENCES public.contratacoes(id) ON DELETE CASCADE,
  usuario_id      UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  acao            TEXT NOT NULL,
  status_anterior TEXT,
  status_novo     TEXT NOT NULL,
  observacao      TEXT,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.historico_contratacoes IS 'Histórico de auditoria e remarcações das contratações';

-- 8. Enable Row Level Security
ALTER TABLE public.contratacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historico_contratacoes ENABLE ROW LEVEL SECURITY;

-- 9. Recreate RLS Policies on public.contratacoes (formerly agendamentos)
DROP POLICY IF EXISTS "Agendamentos - acesso total admin" ON public.contratacoes;
DROP POLICY IF EXISTS "Agendamentos - consumidor cria" ON public.contratacoes;
DROP POLICY IF EXISTS "Agendamentos - consumidor visualiza proprio" ON public.contratacoes;
DROP POLICY IF EXISTS "Agendamentos - consumidor atualiza proprio" ON public.contratacoes;
DROP POLICY IF EXISTS "Agendamentos - prestador visualiza recebidos" ON public.contratacoes;
DROP POLICY IF EXISTS "Agendamentos - prestador atualiza recebidos" ON public.contratacoes;

DROP POLICY IF EXISTS "Contratacoes - acesso total admin" ON public.contratacoes;
DROP POLICY IF EXISTS "Contratacoes - consumidor cria" ON public.contratacoes;
DROP POLICY IF EXISTS "Contratacoes - consumidor visualiza proprio" ON public.contratacoes;
DROP POLICY IF EXISTS "Contratacoes - consumidor atualiza proprio" ON public.contratacoes;
DROP POLICY IF EXISTS "Contratacoes - prestador visualiza recebidos" ON public.contratacoes;
DROP POLICY IF EXISTS "Contratacoes - prestador atualiza recebidos" ON public.contratacoes;

CREATE POLICY "Contratacoes - acesso total admin" ON public.contratacoes FOR ALL TO authenticated
  USING (public.eh_admin(auth.uid()));
CREATE POLICY "Contratacoes - consumidor cria" ON public.contratacoes FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.consumidores c WHERE c.id = consumidor_id AND c.usuario_id = auth.uid()));
CREATE POLICY "Contratacoes - consumidor visualiza proprio" ON public.contratacoes FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.consumidores c WHERE c.id = consumidor_id AND c.usuario_id = auth.uid()));
CREATE POLICY "Contratacoes - consumidor atualiza proprio" ON public.contratacoes FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.consumidores c WHERE c.id = consumidor_id AND c.usuario_id = auth.uid()));
CREATE POLICY "Contratacoes - prestador visualiza recebidos" ON public.contratacoes FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.prestadores p WHERE p.id = prestador_id AND p.usuario_id = auth.uid()));
CREATE POLICY "Contratacoes - prestador atualiza recebidos" ON public.contratacoes FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.prestadores p WHERE p.id = prestador_id AND p.usuario_id = auth.uid()));

-- 10. Recreate RLS Policies on public.historico_contratacoes
DROP POLICY IF EXISTS "Historico - acesso total admin" ON public.historico_contratacoes;
DROP POLICY IF EXISTS "Historico - consumidor visualiza relacionado" ON public.historico_contratacoes;
DROP POLICY IF EXISTS "Historico - prestador visualiza relacionado" ON public.historico_contratacoes;
DROP POLICY IF EXISTS "Historico - autenticados criam logs" ON public.historico_contratacoes;

CREATE POLICY "Historico - acesso total admin" ON public.historico_contratacoes FOR ALL TO authenticated
  USING (public.eh_admin(auth.uid()));
CREATE POLICY "Historico - consumidor visualiza relacionado" ON public.historico_contratacoes FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.contratacoes c
    JOIN public.consumidores co ON co.id = c.consumidor_id
    WHERE c.id = contratacao_id AND co.usuario_id = auth.uid()
  ));
CREATE POLICY "Historico - prestador visualiza relacionado" ON public.historico_contratacoes FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.contratacoes c
    JOIN public.prestadores pr ON pr.id = c.prestador_id
    WHERE c.id = contratacao_id AND pr.usuario_id = auth.uid()
  ));
CREATE POLICY "Historico - autenticados criam logs" ON public.historico_contratacoes FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = usuario_id);

-- 11. Recreate RLS Policies on public.pagamentos (update table reference)
DROP POLICY IF EXISTS "Pagamentos - consumidor cria" ON public.pagamentos;
DROP POLICY IF EXISTS "Pagamentos - visualizacao relacionada" ON public.pagamentos;

CREATE POLICY "Pagamentos - consumidor cria" ON public.pagamentos FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.contratacoes ag
    JOIN public.consumidores c ON c.id = ag.consumidor_id
    WHERE ag.id = contratacao_id AND c.usuario_id = auth.uid()
  ));
CREATE POLICY "Pagamentos - visualizacao relacionada" ON public.pagamentos FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.contratacoes ag
    LEFT JOIN public.consumidores c ON c.id = ag.consumidor_id
    LEFT JOIN public.prestadores p ON p.id = ag.prestador_id
    WHERE ag.id = contratacao_id AND (c.usuario_id = auth.uid() or p.usuario_id = auth.uid())
  ));

-- 12. Recreate Views
CREATE OR REPLACE VIEW public.vw_agendamentos_detalhados AS
SELECT
  ag.id AS agendamento_id,
  ag.status,
  ag.valor_total AS valor,
  ag.observacoes AS observacao,
  ag.created_at,
  uc.nome AS consumidor_nome,
  uc.email AS consumidor_email,
  up.nome AS prestador_nome,
  p.especialidade AS prestador_especialidade,
  s.nome AS servico_nome,
  s.duracao_minutos,
  a.data AS agenda_data,
  a.hora_inicio,
  a.hora_fim
FROM public.contratacoes ag
LEFT JOIN public.consumidores c ON c.id = ag.consumidor_id
LEFT JOIN public.usuarios uc ON uc.id = c.usuario_id
LEFT JOIN public.prestadores p ON p.id = ag.prestador_id
LEFT JOIN public.usuarios up ON up.id = p.usuario_id
LEFT JOIN public.servicos s ON s.id = ag.servico_id
LEFT JOIN public.agenda a ON a.id = ag.agenda_id;

CREATE OR REPLACE VIEW public.vw_contratacoes_detalhadas AS
SELECT * FROM public.vw_agendamentos_detalhados;

CREATE OR REPLACE VIEW public.vw_dashboard_admin AS
SELECT
  (SELECT COUNT(*) FROM public.usuarios) AS total_usuarios,
  (SELECT COUNT(*) FROM public.prestadores) AS total_prestadores,
  (SELECT COUNT(*) FROM public.consumidores) AS total_consumidores,
  (SELECT COUNT(*) FROM public.contratacoes) AS total_agendamentos,
  (SELECT COUNT(*) FROM public.pagamentos WHERE status = 'aprovado') AS total_pagamentos,
  (SELECT COUNT(*) FROM public.servicos) AS total_servicos,
  (SELECT COUNT(*) FROM public.produtos) AS total_produtos,
  (SELECT COUNT(*) FROM public.anuncios WHERE ativo = TRUE) AS anuncios_ativos;

CREATE OR REPLACE VIEW public.vw_prestadores_ranking AS
SELECT
  p.id,
  p.usuario_id,
  u.nome,
  p.especialidade,
  p.foto_url,
  p.avaliacao_media,
  (SELECT COUNT(*) FROM public.contratacoes ag WHERE ag.prestador_id = p.id AND ag.status = 'concluido') AS total_atendimentos
FROM public.prestadores p
JOIN public.usuarios u ON u.id = p.usuario_id
WHERE p.ativo = TRUE;

-- 13. Recreate View Agenda Disponível (Agenda Inteligente)
CREATE OR REPLACE VIEW public.vw_agenda_disponivel AS
SELECT a.*
FROM public.agenda a
WHERE a.disponivel = TRUE
AND NOT EXISTS (
  SELECT 1
  FROM public.contratacoes c
  WHERE c.agenda_id = a.id
  AND c.status IN (
    'pendente',
    'confirmado',
    'remarcacao_solicitada',
    'remarcado'
  )
);

-- 14. Recreate View Faturamento por Prestador
CREATE OR REPLACE VIEW public.vw_faturamento_prestador AS
SELECT
  p.id AS prestador_id,
  u.nome AS prestador_nome,
  COUNT(ag.id) AS total_agendamentos,
  COUNT(ag.id) FILTER (WHERE ag.status = 'concluido') AS concluidos,
  COALESCE(SUM(ag.valor_total) FILTER (WHERE ag.status IN ('confirmado', 'remarcado', 'concluido')), 0) AS faturamento_total
FROM public.prestadores p
JOIN public.usuarios u ON u.id = p.usuario_id
LEFT JOIN public.contratacoes ag ON ag.prestador_id = p.id
GROUP BY p.id, u.nome
ORDER BY faturamento_total DESC;

COMMENT ON VIEW public.vw_faturamento_prestador IS 'Resumo financeiro por prestador';

