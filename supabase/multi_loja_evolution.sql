-- ====================================================================
-- BarberGo — Migration to Multi-Store Marketplace & Commissions
-- ====================================================================

-- 1. Alter type tipo_usuario to include 'gestor_loja'
ALTER TYPE public.tipo_usuario ADD VALUE IF NOT EXISTS 'gestor_loja';

-- 2. Create public.lojas table
CREATE TABLE IF NOT EXISTS public.lojas (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome        TEXT NOT NULL,
  descricao   TEXT,
  cnpj        TEXT,
  telefone    TEXT,
  email       TEXT,
  endereco    TEXT,
  cidade      TEXT,
  estado      TEXT,
  cep         TEXT,
  logo_url    TEXT,
  capa_url    TEXT,
  ativo       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.lojas IS 'Cadastro de lojas/barbearias parceiras do marketplace';

-- 3. Create public.gestores table
CREATE TABLE IF NOT EXISTS public.gestores (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id  UUID NOT NULL UNIQUE REFERENCES public.usuarios(id) ON DELETE CASCADE,
  loja_id     UUID NOT NULL REFERENCES public.lojas(id) ON DELETE CASCADE,
  created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.gestores IS 'Associação de gestores de loja a cada estabelecimento';

-- 4. Create default store for backward compatibility
INSERT INTO public.lojas (id, nome, descricao, cidade, estado, ativo)
VALUES ('00000000-0000-0000-0000-000000000000', 'BarberGo Matriz', 'Loja padrão do marketplace BarberGo', 'Fortaleza', 'CE', TRUE)
ON CONFLICT (id) DO NOTHING;

-- 5. Add columns to public.prestadores, public.servicos, public.produtos, public.contratacoes
ALTER TABLE public.prestadores ADD COLUMN IF NOT EXISTS loja_id UUID REFERENCES public.lojas(id) ON DELETE SET NULL;
ALTER TABLE public.prestadores ADD COLUMN IF NOT EXISTS comissao_percentual NUMERIC(5, 2) NOT NULL DEFAULT 40.00;

ALTER TABLE public.servicos ADD COLUMN IF NOT EXISTS loja_id UUID REFERENCES public.lojas(id) ON DELETE CASCADE;

ALTER TABLE public.produtos ADD COLUMN IF NOT EXISTS loja_id UUID REFERENCES public.lojas(id) ON DELETE CASCADE;
ALTER TABLE public.produtos ADD COLUMN IF NOT EXISTS categoria TEXT;
ALTER TABLE public.produtos ADD COLUMN IF NOT EXISTS estoque_minimo INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.produtos ALTER COLUMN prestador_id DROP NOT NULL;

ALTER TABLE public.contratacoes ADD COLUMN IF NOT EXISTS loja_id UUID REFERENCES public.lojas(id) ON DELETE SET NULL;

-- 6. Link existing data to the default store
UPDATE public.prestadores SET loja_id = '00000000-0000-0000-0000-000000000000' WHERE loja_id IS NULL;
UPDATE public.servicos SET loja_id = '00000000-0000-0000-0000-000000000000' WHERE loja_id IS NULL;
UPDATE public.produtos SET loja_id = '00000000-0000-0000-0000-000000000000' WHERE loja_id IS NULL;
UPDATE public.contratacoes SET loja_id = '00000000-0000-0000-0000-000000000000' WHERE loja_id IS NULL;

-- Make loja_id NOT NULL for servicos and produtos where possible (optional, keep it flexible)
ALTER TABLE public.servicos ALTER COLUMN loja_id SET DEFAULT '00000000-0000-0000-0000-000000000000';
ALTER TABLE public.produtos ALTER COLUMN loja_id SET DEFAULT '00000000-0000-0000-0000-000000000000';

-- 7. Create public.comissoes table
CREATE TABLE IF NOT EXISTS public.comissoes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prestador_id    UUID NOT NULL REFERENCES public.prestadores(id) ON DELETE CASCADE,
  contratacao_id  UUID NOT NULL REFERENCES public.contratacoes(id) ON DELETE CASCADE,
  percentual      NUMERIC(5, 2) NOT NULL DEFAULT 40.00,
  valor           NUMERIC(10, 2) NOT NULL,
  status          TEXT NOT NULL DEFAULT 'pendente',
  created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.comissoes IS 'Comissões individuais calculadas automaticamente para os prestadores';

-- 8. Functions to support policies and prevent recursions
CREATE OR REPLACE FUNCTION public.eh_gestor(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.usuarios
    WHERE id = user_id AND tipo_usuario = 'gestor_loja'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.obter_loja_gestor(user_id UUID)
RETURNS UUID AS $$
DECLARE
  v_loja_id UUID;
BEGIN
  SELECT loja_id INTO v_loja_id
  FROM public.gestores
  WHERE usuario_id = user_id;
  RETURN v_loja_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Trigger to compute commissions when status becomes 'concluido'
CREATE OR REPLACE FUNCTION public.calcular_comissao_automatica()
RETURNS TRIGGER AS $$
DECLARE
  v_percentual NUMERIC(5, 2);
  v_valor_comissao NUMERIC(10, 2);
BEGIN
  IF NEW.status = 'concluido' AND (OLD.status IS NULL OR OLD.status <> 'concluido') THEN
    SELECT COALESCE(comissao_percentual, 40.00) INTO v_percentual
    FROM public.prestadores
    WHERE id = NEW.prestador_id;

    v_valor_comissao := NEW.valor_total * (v_percentual / 100.0);

    INSERT INTO public.comissoes (prestador_id, contratacao_id, percentual, valor, status)
    VALUES (NEW.prestador_id, NEW.id, v_percentual, v_valor_comissao, 'pendente')
    ON CONFLICT (id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_calcular_comissao ON public.contratacoes;
CREATE TRIGGER trg_calcular_comissao
  AFTER UPDATE OF status ON public.contratacoes
  FOR EACH ROW EXECUTE FUNCTION public.calcular_comissao_automatica();

-- 10. Update handle_new_user trigger to handle gestor_loja
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_nome TEXT;
  v_telefone TEXT;
  v_tipo public.tipo_usuario;
  v_loja_id UUID;
BEGIN
  v_nome := COALESCE(new.raw_user_meta_data->>'nome', '');
  v_telefone := COALESCE(new.raw_user_meta_data->>'telefone', '');
  v_tipo := COALESCE(new.raw_user_meta_data->>'tipo_usuario', 'consumidor')::public.tipo_usuario;
  
  INSERT INTO public.usuarios (id, nome, email, telefone, tipo_usuario)
  VALUES (new.id, v_nome, new.email, v_telefone, v_tipo);

  IF v_tipo = 'prestador' THEN
    INSERT INTO public.prestadores (usuario_id, loja_id)
    VALUES (new.id, COALESCE((new.raw_user_meta_data->>'loja_id')::uuid, '00000000-0000-0000-0000-000000000000'));
  ELSIF v_tipo = 'consumidor' THEN
    INSERT INTO public.consumidores (usuario_id)
    VALUES (new.id);
  ELSIF v_tipo = 'gestor_loja' THEN
    v_loja_id := COALESCE((new.raw_user_meta_data->>'loja_id')::uuid, '00000000-0000-0000-0000-000000000000');
    
    INSERT INTO public.gestores (usuario_id, loja_id)
    VALUES (new.id, v_loja_id);
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Drop dependent views first to allow column re-mappings
DROP VIEW IF EXISTS public.vw_dashboard_admin CASCADE;
DROP VIEW IF EXISTS public.vw_agendamentos_detalhados CASCADE;
DROP VIEW IF EXISTS public.vw_contratacoes_detalhadas CASCADE;
DROP VIEW IF EXISTS public.vw_prestadores_ranking CASCADE;
DROP VIEW IF EXISTS public.vw_faturamento_prestador CASCADE;
DROP VIEW IF EXISTS public.vw_agenda_disponivel CASCADE;

-- Recreate Views
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
  a.hora_fim,
  ag.loja_id,
  l.nome AS loja_nome
FROM public.contratacoes ag
LEFT JOIN public.consumidores c ON c.id = ag.consumidor_id
LEFT JOIN public.usuarios uc ON uc.id = c.usuario_id
LEFT JOIN public.prestadores p ON p.id = ag.prestador_id
LEFT JOIN public.usuarios up ON up.id = p.usuario_id
LEFT JOIN public.servicos s ON s.id = ag.servico_id
LEFT JOIN public.agenda a ON a.id = ag.agenda_id
LEFT JOIN public.lojas l ON l.id = ag.loja_id;

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
  (SELECT COUNT(*) FROM public.anuncios WHERE ativo = TRUE) AS anuncios_ativos,
  (SELECT COUNT(*) FROM public.lojas) AS total_lojas;

CREATE OR REPLACE VIEW public.vw_prestadores_ranking AS
SELECT
  p.id,
  p.usuario_id,
  u.nome,
  p.especialidade,
  p.foto_url,
  p.avaliacao_media,
  p.loja_id,
  (SELECT COUNT(*) FROM public.contratacoes ag WHERE ag.prestador_id = p.id AND ag.status = 'concluido') AS total_atendimentos
FROM public.prestadores p
JOIN public.usuarios u ON u.id = p.usuario_id
WHERE p.ativo = TRUE;

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

CREATE OR REPLACE VIEW public.vw_faturamento_prestador AS
SELECT
  p.id AS prestador_id,
  u.nome AS prestador_nome,
  p.loja_id,
  COUNT(ag.id) AS total_agendamentos,
  COUNT(ag.id) FILTER (WHERE ag.status = 'concluido') AS concluidos,
  COALESCE(SUM(ag.valor_total) FILTER (WHERE ag.status IN ('confirmado', 'remarcado', 'concluido')), 0) AS faturamento_total,
  COALESCE(SUM(co.valor), 0) AS total_comissoes
FROM public.prestadores p
JOIN public.usuarios u ON u.id = p.usuario_id
LEFT JOIN public.contratacoes ag ON ag.prestador_id = p.id
LEFT JOIN public.comissoes co ON co.prestador_id = p.id AND co.contratacao_id = ag.id
GROUP BY p.id, u.nome, p.loja_id;

-- 12. Enable RLS on Lojas, Gestores, Comissoes
ALTER TABLE public.lojas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gestores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comissoes ENABLE ROW LEVEL SECURITY;

-- 13. Create RLS Policies
-- Lojas
DROP POLICY IF EXISTS "Lojas - select geral" ON public.lojas;
DROP POLICY IF EXISTS "Lojas - total admin" ON public.lojas;
DROP POLICY IF EXISTS "Lojas - gestor update" ON public.lojas;

CREATE POLICY "Lojas - select geral" ON public.lojas FOR SELECT
  USING (TRUE);
CREATE POLICY "Lojas - total admin" ON public.lojas FOR ALL TO authenticated
  USING (public.eh_admin(auth.uid()));
CREATE POLICY "Lojas - gestor update" ON public.lojas FOR UPDATE TO authenticated
  USING (id = public.obter_loja_gestor(auth.uid()));

-- Gestores
DROP POLICY IF EXISTS "Gestores - total admin" ON public.gestores;
DROP POLICY IF EXISTS "Gestores - gestor visualiza proprio" ON public.gestores;

CREATE POLICY "Gestores - total admin" ON public.gestores FOR ALL TO authenticated
  USING (public.eh_admin(auth.uid()));
CREATE POLICY "Gestores - gestor visualiza proprio" ON public.gestores FOR SELECT TO authenticated
  USING (usuario_id = auth.uid());

-- Comissoes
DROP POLICY IF EXISTS "Comissoes - total admin" ON public.comissoes;
DROP POLICY IF EXISTS "Comissoes - gestor visualiza loja" ON public.comissoes;
DROP POLICY IF EXISTS "Comissoes - gestor edita loja" ON public.comissoes;
DROP POLICY IF EXISTS "Comissoes - prestador visualiza propria" ON public.comissoes;

CREATE POLICY "Comissoes - total admin" ON public.comissoes FOR ALL TO authenticated
  USING (public.eh_admin(auth.uid()));
CREATE POLICY "Comissoes - gestor visualiza loja" ON public.comissoes FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.prestadores p
    WHERE p.id = prestador_id AND p.loja_id = public.obter_loja_gestor(auth.uid())
  ));
CREATE POLICY "Comissoes - gestor edita loja" ON public.comissoes FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.prestadores p
    WHERE p.id = prestador_id AND p.loja_id = public.obter_loja_gestor(auth.uid())
  ));
CREATE POLICY "Comissoes - prestador visualiza propria" ON public.comissoes FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.prestadores p
    WHERE p.id = prestador_id AND p.usuario_id = auth.uid()
  ));

-- 14. Adjust RLS Policies on other tables to support gestor_loja
-- Prestadores
DROP POLICY IF EXISTS "Prestadores - gestor gerencia" ON public.prestadores;
CREATE POLICY "Prestadores - gestor gerencia" ON public.prestadores FOR ALL TO authenticated
  USING (public.eh_admin(auth.uid()) OR loja_id = public.obter_loja_gestor(auth.uid()));

-- Servicos
DROP POLICY IF EXISTS "Servicos - gestor gerencia" ON public.servicos;
CREATE POLICY "Servicos - gestor gerencia" ON public.servicos FOR ALL TO authenticated
  USING (public.eh_admin(auth.uid()) OR loja_id = public.obter_loja_gestor(auth.uid()));

-- Produtos
DROP POLICY IF EXISTS "Produtos - gestor gerencia" ON public.produtos;
CREATE POLICY "Produtos - gestor gerencia" ON public.produtos FOR ALL TO authenticated
  USING (public.eh_admin(auth.uid()) OR loja_id = public.obter_loja_gestor(auth.uid()));

-- Contratacoes
DROP POLICY IF EXISTS "Contratacoes - gestor gerencia" ON public.contratacoes;
CREATE POLICY "Contratacoes - gestor gerencia" ON public.contratacoes FOR ALL TO authenticated
  USING (public.eh_admin(auth.uid()) OR loja_id = public.obter_loja_gestor(auth.uid()));

-- Pagamentos
DROP POLICY IF EXISTS "Pagamentos - gestor visualiza" ON public.pagamentos;
CREATE POLICY "Pagamentos - gestor visualiza" ON public.pagamentos FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.contratacoes c
    WHERE c.id = contratacao_id AND c.loja_id = public.obter_loja_gestor(auth.uid())
  ));
