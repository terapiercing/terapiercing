-- Migration: Adicionar policies de INSERT na tabela usuarios
-- 1. Permite que usuarios autenticados insiram seu proprio registro (cadastro publico)
-- 2. Permite que admin insira registros de novos clientes (painel administrativo)

-- Policy para cadastro publico (usuario insere seu proprio registro)
DROP POLICY IF EXISTS "usuarios_insert_own" ON public.usuarios;
CREATE POLICY "usuarios_insert_own"
  ON public.usuarios FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Policy para cadastro admin (admin insire registros de outros usuarios)
DROP POLICY IF EXISTS "usuarios_insert_admin" ON public.usuarios;
CREATE POLICY "usuarios_insert_admin"
  ON public.usuarios FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
