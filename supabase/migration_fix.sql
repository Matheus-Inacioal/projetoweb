-- ====================================================================
-- BarberGo — MIGRATION FIX (Estado: agendamentos + contratacoes coexistem)
-- Execute este script no Supabase SQL Editor
-- SEGURO para re-execução (idempotente)
-- ====================================================================

-- ============================================================
-- PASSO 1: Garantir que foto_url existe em prestadores
-- ============================================================
ALTER TABLE public.prestadores ADD COLUMN IF NOT EXISTS foto_url TEXT;

-- ============================================================
-- PASSO 2: Garantir enum status_contratacao
-- ============================================================
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

-- ============================================================
-- PASSO 3: Dropar views que dependem das tabelas
-- ============================================================
DROP VIEW IF EXISTS public.vw_dashboard_admin CASCADE;
DROP VIEW IF EXISTS public.vw_agendamentos_detalhados CASCADE;
DROP VIEW IF EXISTS public.vw_prestadores_ranking CASCADE;
DROP VIEW IF EXISTS public.vw_contratacoes_detalhadas CASCADE;
DROP VIEW IF EXISTS public.vw_faturamento_prestador CASCADE;
DROP VIEW IF EXISTS public.vw_agenda_disponivel CASCADE;
DROP VIEW IF EXISTS public.vw_resumo_plataforma CASCADE;

-- ============================================================
-- PASSO 4: Migrar dados de agendamentos -> contratacoes (se existirem)
-- e então dropar agendamentos
-- ============================================================
DO $$
DECLARE
  has_agendamentos BOOLEAN;
  has_contratacoes BOOLEAN;
  agendamentos_count INTEGER;
BEGIN
  -- Verifica se ambas existem
  SELECT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'agendamentos') INTO has_agendamentos;
  SELECT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'contratacoes') INTO has_contratacoes;

  IF has_agendamentos AND has_contratacoes THEN
    -- Ambas existem: migrar dados de agendamentos que não estão em contratacoes
    SELECT COUNT(*) FROM public.agendamentos INTO agendamentos_count;
    RAISE NOTICE 'Tabela agendamentos tem % registros', agendamentos_count;
    
    IF agendamentos_count > 0 THEN
      -- Inserir APENAS registros com FKs válidas (ignorar dados órfãos)
      INSERT INTO public.contratacoes (id, consumidor_id, prestador_id, servico_id, agenda_id, status, valor_total, observacoes, created_at)
      SELECT 
        a.id, 
        a.consumidor_id, 
        a.prestador_id, 
        a.servico_id, 
        a.agenda_id,
        CASE 
          WHEN a.status::text = 'pago' THEN 'confirmado'::public.status_contratacao
          WHEN a.status::text = 'aguardando_pagamento' THEN 'pendente'::public.status_contratacao
          WHEN a.status::text IN ('pendente','confirmado','recusado','remarcacao_solicitada','remarcado','concluido','cancelado') 
            THEN a.status::text::public.status_contratacao
          ELSE 'pendente'::public.status_contratacao
        END,
        COALESCE(a.valor_total, 0),
        a.observacoes,
        a.created_at
      FROM public.agendamentos a
      -- Validar que as FKs existem (evitar dados órfãos)
      WHERE EXISTS (SELECT 1 FROM public.consumidores co WHERE co.id = a.consumidor_id)
        AND EXISTS (SELECT 1 FROM public.prestadores pr WHERE pr.id = a.prestador_id)
        AND NOT EXISTS (SELECT 1 FROM public.contratacoes c WHERE c.id = a.id)
      ON CONFLICT (id) DO NOTHING;
      
      RAISE NOTICE 'Dados válidos migrados de agendamentos para contratacoes (registros órfãos ignorados)';
    END IF;

    -- Atualizar pagamentos que referenciam agendamento_id
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'pagamentos' AND column_name = 'agendamento_id'
    ) THEN
      ALTER TABLE public.pagamentos RENAME COLUMN agendamento_id TO contratacao_id;
      RAISE NOTICE 'Coluna pagamentos.agendamento_id renomeada para contratacao_id';
    END IF;

    -- Dropar tabela antiga
    DROP TABLE public.agendamentos CASCADE;
    RAISE NOTICE 'Tabela agendamentos removida com sucesso';

  ELSIF has_agendamentos AND NOT has_contratacoes THEN
    -- Só agendamentos existe: renomear normalmente
    ALTER TABLE public.agendamentos RENAME TO contratacoes;
    RAISE NOTICE 'Tabela agendamentos renomeada para contratacoes';
    
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'pagamentos' AND column_name = 'agendamento_id'
    ) THEN
      ALTER TABLE public.pagamentos RENAME COLUMN agendamento_id TO contratacao_id;
    END IF;

  ELSE
    RAISE NOTICE 'contratacoes já existe e agendamentos não existe. Nada a migrar.';
  END IF;
END
$$;

-- ============================================================
-- PASSO 5: Garantir que contratacoes tem a coluna status correta
-- ============================================================
DO $$
DECLARE
  col_type TEXT;
BEGIN
  SELECT data_type FROM information_schema.columns 
  WHERE table_schema = 'public' AND table_name = 'contratacoes' AND column_name = 'status'
  INTO col_type;
  
  IF col_type = 'text' OR col_type = 'character varying' THEN
    -- Converter status text para o enum
    UPDATE public.contratacoes
    SET status = CASE
      WHEN status::text = 'pago' THEN 'confirmado'
      WHEN status::text = 'aguardando_pagamento' THEN 'pendente'
      ELSE status::text
    END
    WHERE status::text NOT IN ('pendente', 'confirmado', 'recusado', 'remarcacao_solicitada', 'remarcado', 'concluido', 'cancelado');
    
    ALTER TABLE public.contratacoes 
      ALTER COLUMN status TYPE public.status_contratacao 
      USING (status::text::public.status_contratacao);
    
    RAISE NOTICE 'Coluna status convertida para enum status_contratacao';
  ELSE
    RAISE NOTICE 'Coluna status já é do tipo correto: %', col_type;
  END IF;
END
$$;

-- Garantir coluna loja_id em contratacoes
ALTER TABLE public.contratacoes ADD COLUMN IF NOT EXISTS loja_id UUID REFERENCES public.lojas(id) ON DELETE SET NULL;

-- ============================================================
-- PASSO 6: Garantir tabela historico_contratacoes
-- ============================================================
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

-- ============================================================
-- PASSO 7: Garantir tabela configuracoes_plataforma
-- ============================================================
CREATE TABLE IF NOT EXISTS public.configuracoes_plataforma (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chave           TEXT NOT NULL UNIQUE,
  valor           TEXT,
  descricao       TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.configuracoes_plataforma IS 'Configurações globais da plataforma BarberGo';

-- Inserir configurações padrão se tabela estiver vazia
INSERT INTO public.configuracoes_plataforma (chave, valor, descricao) 
VALUES 
  ('comissao_padrao', '40', 'Percentual padrão de comissão para prestadores'),
  ('taxa_plataforma', '10', 'Percentual de taxa da plataforma sobre cada serviço'),
  ('moeda', 'BRL', 'Moeda padrão do sistema'),
  ('mercado_pago_ativo', 'true', 'Se integração com Mercado Pago está ativa'),
  ('nome_plataforma', 'BarberGo', 'Nome da plataforma')
ON CONFLICT (chave) DO NOTHING;

-- ============================================================
-- PASSO 8: RLS em contratacoes e historico_contratacoes
-- ============================================================
ALTER TABLE public.contratacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historico_contratacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracoes_plataforma ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- PASSO 9: Policies para contratacoes
-- ============================================================
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
DROP POLICY IF EXISTS "Contratacoes - gestor visualiza loja" ON public.contratacoes;

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
CREATE POLICY "Contratacoes - gestor visualiza loja" ON public.contratacoes FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.gestores g 
    WHERE g.usuario_id = auth.uid() AND g.loja_id = loja_id
  ));

-- ============================================================
-- PASSO 10: Policies para historico_contratacoes
-- ============================================================
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

-- ============================================================
-- PASSO 11: Policies para configuracoes_plataforma
-- ============================================================
DROP POLICY IF EXISTS "Config - leitura publica" ON public.configuracoes_plataforma;
DROP POLICY IF EXISTS "Config - admin gerencia" ON public.configuracoes_plataforma;

CREATE POLICY "Config - leitura publica" ON public.configuracoes_plataforma FOR SELECT TO authenticated
  USING (true);
CREATE POLICY "Config - admin gerencia" ON public.configuracoes_plataforma FOR ALL TO authenticated
  USING (public.eh_admin(auth.uid()));

-- ============================================================
-- PASSO 12: Policies para pagamentos (atualizar referência)
-- ============================================================
DROP POLICY IF EXISTS "Pagamentos - consumidor cria" ON public.pagamentos;
DROP POLICY IF EXISTS "Pagamentos - visualizacao relacionada" ON public.pagamentos;

-- Somente criar se contratacao_id existir em pagamentos
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'pagamentos' AND column_name = 'contratacao_id'
  ) THEN
    EXECUTE 'CREATE POLICY "Pagamentos - consumidor cria" ON public.pagamentos FOR INSERT TO authenticated
      WITH CHECK (EXISTS (
        SELECT 1 FROM public.contratacoes ag
        JOIN public.consumidores c ON c.id = ag.consumidor_id
        WHERE ag.id = contratacao_id AND c.usuario_id = auth.uid()
      ))';
    EXECUTE 'CREATE POLICY "Pagamentos - visualizacao relacionada" ON public.pagamentos FOR SELECT TO authenticated
      USING (EXISTS (
        SELECT 1 FROM public.contratacoes ag
        LEFT JOIN public.consumidores c ON c.id = ag.consumidor_id
        LEFT JOIN public.prestadores p ON p.id = ag.prestador_id
        WHERE ag.id = contratacao_id AND (c.usuario_id = auth.uid() OR p.usuario_id = auth.uid())
      ))';
  END IF;
END
$$;

-- ============================================================
-- PASSO 13: Recriar TODAS as views
-- ============================================================

-- View: Agendamentos detalhados
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

COMMENT ON VIEW public.vw_agendamentos_detalhados IS 'Visão detalhada dos agendamentos/contratações';

-- View alias
CREATE OR REPLACE VIEW public.vw_contratacoes_detalhadas AS
SELECT * FROM public.vw_agendamentos_detalhados;

-- View: Dashboard Admin
CREATE OR REPLACE VIEW public.vw_dashboard_admin AS
SELECT
  (SELECT COUNT(*) FROM public.usuarios) AS total_usuarios,
  (SELECT COUNT(*) FROM public.prestadores) AS total_prestadores,
  (SELECT COUNT(*) FROM public.consumidores) AS total_consumidores,
  (SELECT COUNT(*) FROM public.contratacoes) AS total_agendamentos,
  (SELECT COUNT(*) FROM public.pagamentos WHERE status = 'aprovado') AS total_pagamentos,
  (SELECT COUNT(*) FROM public.servicos) AS total_servicos,
  (SELECT COUNT(*) FROM public.produtos) AS total_produtos,
  (SELECT COUNT(*) FROM public.anuncios WHERE ativo = TRUE) AS anuncios_ativos,
  (SELECT COUNT(*) FROM public.lojas WHERE ativo = TRUE) AS total_lojas;

-- View: Ranking de Prestadores
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

-- View: Agenda Disponível (Agenda Inteligente)
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

-- View: Faturamento por Prestador
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

-- View: Resumo da Plataforma (para admin)
CREATE OR REPLACE VIEW public.vw_resumo_plataforma AS
SELECT
  (SELECT COUNT(*) FROM public.usuarios) AS total_usuarios,
  (SELECT COUNT(*) FROM public.lojas WHERE ativo = TRUE) AS total_lojas,
  (SELECT COUNT(*) FROM public.prestadores WHERE ativo = TRUE) AS total_prestadores,
  (SELECT COUNT(*) FROM public.consumidores) AS total_consumidores,
  (SELECT COUNT(*) FROM public.contratacoes) AS total_contratacoes,
  (SELECT COUNT(*) FROM public.contratacoes WHERE status = 'concluido') AS contratacoes_concluidas,
  (SELECT COALESCE(SUM(valor_total), 0) FROM public.contratacoes WHERE status IN ('confirmado','concluido','remarcado')) AS faturamento_total,
  (SELECT COUNT(*) FROM public.produtos) AS total_produtos,
  (SELECT COUNT(*) FROM public.servicos) AS total_servicos;

COMMENT ON VIEW public.vw_resumo_plataforma IS 'Resumo geral da plataforma para dashboard admin';

-- ============================================================
-- PASSO 14: Trigger de comissão automática (se não existir)
-- ============================================================
CREATE OR REPLACE FUNCTION public.calcular_comissao_automatica()
RETURNS TRIGGER AS $$
DECLARE
  percentual_comissao NUMERIC(5,2) := 40.00;
BEGIN
  IF NEW.status = 'concluido' AND (OLD.status IS NULL OR OLD.status != 'concluido') THEN
    -- Buscar percentual customizado (se existir configuração)
    SELECT COALESCE(
      (SELECT valor::NUMERIC FROM public.configuracoes_plataforma WHERE chave = 'comissao_padrao'),
      40.00
    ) INTO percentual_comissao;

    INSERT INTO public.comissoes (prestador_id, contratacao_id, percentual, valor, status)
    VALUES (
      NEW.prestador_id,
      NEW.id,
      percentual_comissao,
      NEW.valor_total * (percentual_comissao / 100),
      'pendente'
    )
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_comissao_automatica ON public.contratacoes;
CREATE TRIGGER trg_comissao_automatica
  AFTER UPDATE ON public.contratacoes
  FOR EACH ROW
  EXECUTE FUNCTION public.calcular_comissao_automatica();

-- ============================================================
-- FINALIZAÇÃO
-- ============================================================
SELECT 'Migration fix concluída com sucesso!' AS resultado;
