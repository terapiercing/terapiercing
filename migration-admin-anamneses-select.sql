-- Migration: Permitir que admin visualize anamneses de qualquer paciente
-- Execute este script no SQL Editor do Supabase

DROP POLICY IF EXISTS "anamneses_select_admin" ON public.anamneses;
CREATE POLICY "anamneses_select_admin"
  ON public.anamneses FOR SELECT
  USING (public.is_admin());
