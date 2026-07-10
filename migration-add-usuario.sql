-- ============================================================
-- Migração: Adicionar coluna usuario na tabela usuarios
-- Executar no SQL Editor do Supabase ANTES de atualizar o app
-- ============================================================

-- 1. Adicionar coluna usuario (nome de usuario unico)
ALTER TABLE public.usuarios
  ADD COLUMN IF NOT EXISTS usuario TEXT UNIQUE;

-- ============================================================
-- Fim da migração
-- ============================================================
