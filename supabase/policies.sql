-- ============================================================
-- BarberGo — Row Level Security (RLS) Policies
-- Execute APÓS o schema.sql no SQL Editor do Supabase Dashboard
-- ============================================================

-- ============================================================
-- 1. PROFILES
-- ============================================================
alter table profiles enable row level security;

-- Qualquer usuário autenticado pode ler todos os perfis
create policy "profiles_select_authenticated"
  on profiles for select
  to authenticated
  using (true);

-- Usuário pode atualizar apenas o próprio perfil
create policy "profiles_update_own"
  on profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ============================================================
-- 2. BARBEARIAS
-- ============================================================
alter table barbearias enable row level security;

-- Qualquer pessoa (incluindo anon) pode listar barbearias
create policy "barbearias_select_all"
  on barbearias for select
  to anon, authenticated
  using (true);

-- Usuário autenticado pode criar barbearia (será o responsável)
create policy "barbearias_insert_authenticated"
  on barbearias for insert
  to authenticated
  with check (auth.uid() = responsavel_id);

-- Responsável pode atualizar sua barbearia
create policy "barbearias_update_owner"
  on barbearias for update
  to authenticated
  using (auth.uid() = responsavel_id)
  with check (auth.uid() = responsavel_id);

-- Admin pode atualizar qualquer barbearia
create policy "barbearias_update_admin"
  on barbearias for update
  to authenticated
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.perfil = 'ADMIN'
    )
  );

-- ============================================================
-- 3. BARBEIROS
-- ============================================================
alter table barbeiros enable row level security;

-- Qualquer pessoa pode listar barbeiros
create policy "barbeiros_select_all"
  on barbeiros for select
  to anon, authenticated
  using (true);

-- Responsável da barbearia pode criar barbeiros
create policy "barbeiros_insert_owner"
  on barbeiros for insert
  to authenticated
  with check (
    exists (
      select 1 from barbearias
      where barbearias.id = barbearia_id
        and barbearias.responsavel_id = auth.uid()
    )
    or
    -- Prestador PF pode criar seu próprio perfil de barbeiro
    auth.uid() = usuario_id
  );

-- Responsável da barbearia ou o próprio barbeiro pode atualizar
create policy "barbeiros_update_owner"
  on barbeiros for update
  to authenticated
  using (
    auth.uid() = usuario_id
    or exists (
      select 1 from barbearias
      where barbearias.id = barbearia_id
        and barbearias.responsavel_id = auth.uid()
    )
  );

-- Admin pode inserir/atualizar qualquer barbeiro
create policy "barbeiros_admin_insert"
  on barbeiros for insert
  to authenticated
  with check (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.perfil = 'ADMIN'
    )
  );

create policy "barbeiros_admin_update"
  on barbeiros for update
  to authenticated
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.perfil = 'ADMIN'
    )
  );

-- ============================================================
-- 4. SERVICOS
-- ============================================================
alter table servicos enable row level security;

-- Qualquer pessoa pode listar serviços
create policy "servicos_select_all"
  on servicos for select
  to anon, authenticated
  using (true);

-- Responsável da barbearia pode criar serviços
create policy "servicos_insert_owner"
  on servicos for insert
  to authenticated
  with check (
    exists (
      select 1 from barbearias
      where barbearias.id = barbearia_id
        and barbearias.responsavel_id = auth.uid()
    )
  );

-- Responsável pode atualizar serviços da sua barbearia
create policy "servicos_update_owner"
  on servicos for update
  to authenticated
  using (
    exists (
      select 1 from barbearias
      where barbearias.id = barbearia_id
        and barbearias.responsavel_id = auth.uid()
    )
  );

-- Admin pode gerenciar qualquer serviço
create policy "servicos_admin_all"
  on servicos for all
  to authenticated
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.perfil = 'ADMIN'
    )
  );

-- ============================================================
-- 5. DISPONIBILIDADES
-- ============================================================
alter table disponibilidades enable row level security;

-- Qualquer pessoa pode listar disponibilidades
create policy "disponibilidades_select_all"
  on disponibilidades for select
  to anon, authenticated
  using (true);

-- Barbeiro dono pode criar disponibilidade
create policy "disponibilidades_insert_barbeiro"
  on disponibilidades for insert
  to authenticated
  with check (
    exists (
      select 1 from barbeiros
      where barbeiros.id = barbeiro_id
        and barbeiros.usuario_id = auth.uid()
    )
  );

-- Admin pode gerenciar qualquer disponibilidade
create policy "disponibilidades_admin_all"
  on disponibilidades for all
  to authenticated
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.perfil = 'ADMIN'
    )
  );

-- ============================================================
-- 6. AGENDAMENTOS
-- ============================================================
alter table agendamentos enable row level security;

-- Contratante pode ver seus próprios agendamentos
create policy "agendamentos_select_contratante"
  on agendamentos for select
  to authenticated
  using (auth.uid() = contratante_id);

-- Barbeiro pode ver agendamentos direcionados a ele
create policy "agendamentos_select_barbeiro"
  on agendamentos for select
  to authenticated
  using (
    exists (
      select 1 from barbeiros
      where barbeiros.id = barbeiro_id
        and barbeiros.usuario_id = auth.uid()
    )
  );

-- Responsável da barbearia pode ver agendamentos da barbearia
create policy "agendamentos_select_barbearia"
  on agendamentos for select
  to authenticated
  using (
    exists (
      select 1 from barbearias
      where barbearias.id = barbearia_id
        and barbearias.responsavel_id = auth.uid()
    )
  );

-- Admin pode ver todos os agendamentos
create policy "agendamentos_select_admin"
  on agendamentos for select
  to authenticated
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.perfil = 'ADMIN'
    )
  );

-- Contratante pode criar agendamentos
create policy "agendamentos_insert_contratante"
  on agendamentos for insert
  to authenticated
  with check (auth.uid() = contratante_id);

-- Contratante, barbeiro, responsável ou admin podem atualizar (cancelar etc.)
create policy "agendamentos_update_envolvidos"
  on agendamentos for update
  to authenticated
  using (
    auth.uid() = contratante_id
    or exists (
      select 1 from barbeiros
      where barbeiros.id = barbeiro_id
        and barbeiros.usuario_id = auth.uid()
    )
    or exists (
      select 1 from barbearias
      where barbearias.id = barbearia_id
        and barbearias.responsavel_id = auth.uid()
    )
    or exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.perfil = 'ADMIN'
    )
  );

-- ============================================================
-- 7. AVALIACOES
-- ============================================================
alter table avaliacoes enable row level security;

-- Qualquer pessoa pode ver avaliações
create policy "avaliacoes_select_all"
  on avaliacoes for select
  to anon, authenticated
  using (true);

-- Contratante do agendamento pode criar avaliação
create policy "avaliacoes_insert_contratante"
  on avaliacoes for insert
  to authenticated
  with check (
    exists (
      select 1 from agendamentos
      where agendamentos.id = agendamento_id
        and agendamentos.contratante_id = auth.uid()
    )
  );

-- ============================================================
-- 8. FAVORITOS
-- ============================================================
alter table favoritos enable row level security;

-- Usuário pode ver seus próprios favoritos
create policy "favoritos_select_own"
  on favoritos for select
  to authenticated
  using (auth.uid() = usuario_id);

-- Usuário pode adicionar favoritos
create policy "favoritos_insert_own"
  on favoritos for insert
  to authenticated
  with check (auth.uid() = usuario_id);

-- Usuário pode remover seus favoritos
create policy "favoritos_delete_own"
  on favoritos for delete
  to authenticated
  using (auth.uid() = usuario_id);

-- ============================================================
-- 9. FOTOS
-- ============================================================
alter table fotos enable row level security;

-- Qualquer pessoa pode ver fotos
create policy "fotos_select_all"
  on fotos for select
  to anon, authenticated
  using (true);

-- Responsável da barbearia pode adicionar fotos
create policy "fotos_insert_owner"
  on fotos for insert
  to authenticated
  with check (
    exists (
      select 1 from barbearias
      where barbearias.id = barbearia_id
        and barbearias.responsavel_id = auth.uid()
    )
  );

-- Responsável da barbearia pode remover fotos
create policy "fotos_delete_owner"
  on fotos for delete
  to authenticated
  using (
    exists (
      select 1 from barbearias
      where barbearias.id = barbearia_id
        and barbearias.responsavel_id = auth.uid()
    )
  );

-- ============================================================
-- 10. STORAGE POLICIES (bucket 'fotos')
-- ============================================================

-- Qualquer pessoa pode visualizar fotos no bucket
create policy "storage_fotos_select_all"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'fotos');

-- Usuário autenticado pode fazer upload
create policy "storage_fotos_insert_authenticated"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'fotos');

-- Usuário autenticado pode deletar suas fotos
create policy "storage_fotos_delete_authenticated"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'fotos');
