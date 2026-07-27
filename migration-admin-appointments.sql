-- Migration: Adicionar policies de INSERT, UPDATE e DELETE para admin na tabela apontamentos
-- Execute este script no SQL Editor do Supabase

-- Admin pode inserir agendamentos (para qualquer paciente)
DROP POLICY IF EXISTS "apontamentos_insert_admin" ON public.apontamentos;
CREATE POLICY "apontamentos_insert_admin"
  ON public.apontamentos FOR INSERT
  WITH CHECK (public.is_admin());

-- Admin pode atualizar agendamentos (mudar status, notas, etc.)
DROP POLICY IF EXISTS "apontamentos_update_admin" ON public.apontamentos;
CREATE POLICY "apontamentos_update_admin"
  ON public.apontamentos FOR UPDATE
  USING (public.is_admin());

-- Admin pode excluir agendamentos
DROP POLICY IF EXISTS "apontamentos_delete_admin" ON public.apontamentos;
CREATE POLICY "apontamentos_delete_admin"
  ON public.apontamentos FOR DELETE
  USING (public.is_admin());

