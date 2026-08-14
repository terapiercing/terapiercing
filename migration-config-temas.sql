-- Migration: Configuração visual da clínica (nome + tema)
-- Rode este arquivo no Supabase SQL Editor (ou onde aplica migrations).

-- =============================================================
-- 1. Coluna `tema` em configuracao_temas
-- Identifica uma das 5 paletas definidas no código (src/lib/themes.ts).
-- O DEFAULT preenche a linha existente automaticamente.
-- =============================================================
ALTER TABLE public.configuracao_temas
  ADD COLUMN IF NOT EXISTS tema TEXT NOT NULL DEFAULT 'terra';

-- =============================================================
-- 2. Leitura pública da configuração
-- Nome da clínica e tema não são dados sensíveis. Sem essa policy,
-- a landing page e as telas de login não conseguem exibir o nome/tema.
-- A escrita continua restrita a admin (policy temas_update_admin).
-- =============================================================
DROP POLICY IF EXISTS "temas_select_public" ON public.configuracao_temas;
CREATE POLICY "temas_select_public"
  ON public.configuracao_temas FOR SELECT
  USING (true);

-- =============================================================
-- 3. INSERT de admin (só usado se a linha padrão não existir)
-- A linha padrão é criada pelo seed do schema.sql.
-- =============================================================
DROP POLICY IF EXISTS "temas_insert_admin" ON public.configuracao_temas;
CREATE POLICY "temas_insert_admin"
  ON public.configuracao_temas FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
