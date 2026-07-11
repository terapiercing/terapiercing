-- Migration: Reestruturar tabela anamneses para suportar múltiplas respostas por paciente
-- Execute este script no Supabase SQL Editor

-- 1. Remover a constraint UNIQUE de patient_id (se existir)
ALTER TABLE public.anamneses DROP CONSTRAINT IF EXISTS anamneses_patient_id_key;

-- 2. Adicionar colunas novas
ALTER TABLE public.anamneses
  ADD COLUMN IF NOT EXISTS servico_id UUID REFERENCES public.servicos(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS formulario_template_id UUID REFERENCES public.formulario_templates(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS apontamento_id UUID REFERENCES public.apontamentos(id) ON DELETE SET NULL;

-- 3. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_anamneses_patient_id ON public.anamneses(patient_id);
CREATE INDEX IF NOT EXISTS idx_anamneses_servico_id ON public.anamneses(servico_id);
CREATE INDEX IF NOT EXISTS idx_anamneses_apontamento_id ON public.anamneses(apontamento_id);
