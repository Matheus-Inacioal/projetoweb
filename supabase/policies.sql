-- ============================================================
-- BarberGo — RLS Policies
-- Execute APÓS o schema.sql
-- ============================================================

-- USUARIOS
alter table usuarios enable row level security;
create policy "usuarios_select" on usuarios for select to authenticated using (true);
create policy "usuarios_update_own" on usuarios for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

-- PRESTADORES
alter table prestadores enable row level security;
create policy "prestadores_select" on prestadores for select to anon, authenticated using (true);
create policy "prestadores_insert" on prestadores for insert to authenticated with check (auth.uid() = usuario_id);
create policy "prestadores_update" on prestadores for update to authenticated using (auth.uid() = usuario_id);

-- CONSUMIDORES
alter table consumidores enable row level security;
create policy "consumidores_select" on consumidores for select to authenticated using (true);
create policy "consumidores_insert" on consumidores for insert to authenticated with check (auth.uid() = usuario_id);

-- SERVICOS
alter table servicos enable row level security;
create policy "servicos_select" on servicos for select to anon, authenticated using (true);
create policy "servicos_insert" on servicos for insert to authenticated
  with check (exists (select 1 from prestadores where id = prestador_id and usuario_id = auth.uid()));
create policy "servicos_update" on servicos for update to authenticated
  using (exists (select 1 from prestadores where id = prestador_id and usuario_id = auth.uid()));
create policy "servicos_delete" on servicos for delete to authenticated
  using (exists (select 1 from prestadores where id = prestador_id and usuario_id = auth.uid()));

-- AGENDA
alter table agenda enable row level security;
create policy "agenda_select" on agenda for select to anon, authenticated using (true);
create policy "agenda_insert" on agenda for insert to authenticated
  with check (exists (select 1 from prestadores where id = prestador_id and usuario_id = auth.uid()));
create policy "agenda_update" on agenda for update to authenticated
  using (exists (select 1 from prestadores where id = prestador_id and usuario_id = auth.uid()));
create policy "agenda_delete" on agenda for delete to authenticated
  using (exists (select 1 from prestadores where id = prestador_id and usuario_id = auth.uid()));

-- CONTRATACOES
alter table contratacoes enable row level security;
create policy "contratacoes_select_consumidor" on contratacoes for select to authenticated
  using (auth.uid() = consumidor_id);
create policy "contratacoes_select_prestador" on contratacoes for select to authenticated
  using (exists (select 1 from prestadores where id = prestador_id and usuario_id = auth.uid()));
create policy "contratacoes_select_admin" on contratacoes for select to authenticated
  using (exists (select 1 from usuarios where id = auth.uid() and tipo = 'admin'));
create policy "contratacoes_insert" on contratacoes for insert to authenticated
  with check (auth.uid() = consumidor_id);
create policy "contratacoes_update" on contratacoes for update to authenticated
  using (auth.uid() = consumidor_id or exists (select 1 from prestadores where id = prestador_id and usuario_id = auth.uid()));

-- FAVORITOS
alter table favoritos enable row level security;
create policy "favoritos_select" on favoritos for select to authenticated using (auth.uid() = consumidor_id);
create policy "favoritos_insert" on favoritos for insert to authenticated with check (auth.uid() = consumidor_id);
create policy "favoritos_delete" on favoritos for delete to authenticated using (auth.uid() = consumidor_id);

-- ANUNCIOS
alter table anuncios enable row level security;
create policy "anuncios_select" on anuncios for select to anon, authenticated using (true);
create policy "anuncios_insert" on anuncios for insert to authenticated
  with check (exists (select 1 from prestadores where id = prestador_id and usuario_id = auth.uid()));
create policy "anuncios_update" on anuncios for update to authenticated
  using (exists (select 1 from prestadores where id = prestador_id and usuario_id = auth.uid()));
create policy "anuncios_delete" on anuncios for delete to authenticated
  using (exists (select 1 from prestadores where id = prestador_id and usuario_id = auth.uid()));

-- STORAGE
create policy "perfis_select" on storage.objects for select to anon, authenticated using (bucket_id = 'perfis');
create policy "perfis_insert" on storage.objects for insert to authenticated with check (bucket_id = 'perfis');
create policy "perfis_delete" on storage.objects for delete to authenticated using (bucket_id = 'perfis');
