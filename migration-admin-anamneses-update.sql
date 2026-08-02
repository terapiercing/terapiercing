-- Migration: Permitir que admin edite anamneses de qualquer paciente
-- Execute este script no SQL Editor do Supabase

DROP POLICY IF EXISTS "anamneses_update_admin" ON public.anamneses;
CREATE POLICY "anamneses_update_admin"
  ON public.anamneses FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
