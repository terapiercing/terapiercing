-- Migration: Adicionar políticas RLS de escrita para admin
-- Tabelas afetadas: disponibilidades, servicos, bloqueios, formulario_templates, configuracao_temas

-- =============================================================
-- disponibilidades: admin pode INSERT, UPDATE, DELETE
-- =============================================================
DROP POLICY IF EXISTS "disponibilidades_insert_admin" ON public.disponibilidades;
CREATE POLICY "disponibilidades_insert_admin"
  ON public.disponibilidades FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "disponibilidades_update_admin" ON public.disponibilidades;
CREATE POLICY "disponibilidades_update_admin"
  ON public.disponibilidades FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "disponibilidades_delete_admin" ON public.disponibilidades;
CREATE POLICY "disponibilidades_delete_admin"
  ON public.disponibilidades FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =============================================================
-- servicos: admin pode INSERT, UPDATE, DELETE
-- =============================================================
DROP POLICY IF EXISTS "servicos_insert_admin" ON public.servicos;
CREATE POLICY "servicos_insert_admin"
  ON public.servicos FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "servicos_update_admin" ON public.servicos;
CREATE POLICY "servicos_update_admin"
  ON public.servicos FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "servicos_delete_admin" ON public.servicos;
CREATE POLICY "servicos_delete_admin"
  ON public.servicos FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =============================================================
-- bloqueios: admin pode INSERT, UPDATE, DELETE
-- =============================================================
DROP POLICY IF EXISTS "bloqueios_insert_admin" ON public.bloqueios;
CREATE POLICY "bloqueios_insert_admin"
  ON public.bloqueios FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "bloqueios_update_admin" ON public.bloqueios;
CREATE POLICY "bloqueios_update_admin"
  ON public.bloqueios FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "bloqueios_delete_admin" ON public.bloqueios;
CREATE POLICY "bloqueios_delete_admin"
  ON public.bloqueios FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =============================================================
-- formulario_templates: admin pode INSERT, UPDATE, DELETE
-- =============================================================
DROP POLICY IF EXISTS "templates_insert_admin" ON public.formulario_templates;
CREATE POLICY "templates_insert_admin"
  ON public.formulario_templates FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "templates_update_admin" ON public.formulario_templates;
CREATE POLICY "templates_update_admin"
  ON public.formulario_templates FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "templates_delete_admin" ON public.formulario_templates;
CREATE POLICY "templates_delete_admin"
  ON public.formulario_templates FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =============================================================
-- configuracao_temas: admin pode UPDATE
-- =============================================================
DROP POLICY IF EXISTS "temas_update_admin" ON public.configuracao_temas;
CREATE POLICY "temas_update_admin"
  ON public.configuracao_temas FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =============================================================
-- servicos: público (não autenticado) também pode ler serviços ativos
-- para exibir na landing page
-- =============================================================
DROP POLICY IF EXISTS "servicos_select_public" ON public.servicos;
CREATE POLICY "servicos_select_public"
  ON public.servicos FOR SELECT
  USING (true);
