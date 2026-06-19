-- ====================================================================
-- BarberGo — Correção de Políticas RLS para pedido_itens e pagamentos_produtos
-- Execute este script no editor SQL do Supabase
-- ====================================================================

-- 1. Garantir RLS habilitado nas tabelas
ALTER TABLE public.pedido_itens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagamentos_produtos ENABLE ROW LEVEL SECURITY;

-- 2. Corrigir políticas para a tabela: pedido_itens
DROP POLICY IF EXISTS "PedidoItens - consumidor cria" ON public.pedido_itens;
DROP POLICY IF EXISTS "PedidoItens - consumidor visualiza" ON public.pedido_itens;

-- Permite ao consumidor visualizar os itens de seus próprios pedidos
CREATE POLICY "PedidoItens - consumidor visualiza" ON public.pedido_itens 
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.pedidos pd
    JOIN public.consumidores c ON c.id = pd.consumidor_id
    WHERE pd.id = pedido_id AND c.usuario_id = auth.uid()
  ));

-- Permite ao consumidor criar/inserir itens associados aos seus próprios pedidos
CREATE POLICY "PedidoItens - consumidor cria" ON public.pedido_itens 
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.pedidos pd
    JOIN public.consumidores c ON c.id = pd.consumidor_id
    WHERE pd.id = pedido_id AND c.usuario_id = auth.uid()
  ));


-- 3. Corrigir políticas para a tabela: pagamentos_produtos
DROP POLICY IF EXISTS "PagProdutos - consumidor cria" ON public.pagamentos_produtos;
DROP POLICY IF EXISTS "PagProdutos - consumidor visualiza" ON public.pagamentos_produtos;

-- Permite ao consumidor visualizar as informações de pagamento dos seus próprios pedidos
CREATE POLICY "PagProdutos - consumidor visualiza" ON public.pagamentos_produtos 
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.pedidos pd
    JOIN public.consumidores c ON c.id = pd.consumidor_id
    WHERE pd.id = pedido_id AND c.usuario_id = auth.uid()
  ));

-- Permite ao consumidor criar/inserir pagamentos associados aos seus próprios pedidos
CREATE POLICY "PagProdutos - consumidor cria" ON public.pagamentos_produtos 
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.pedidos pd
    JOIN public.consumidores c ON c.id = pd.consumidor_id
    WHERE pd.id = pedido_id AND c.usuario_id = auth.uid()
  ));

SELECT 'RLS para pedido_itens e pagamentos_produtos corrigidos com sucesso!' AS resultado;
