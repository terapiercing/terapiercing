-- ============================================================
-- Migração: Atualizar estrutura endereco + RLS
-- Executar no SQL Editor do Supabase ANTES de atualizar o app
-- ============================================================

-- 1. Adicionar colunas de endereco separado
ALTER TABLE public.usuarios
  ADD COLUMN IF NOT EXISTS numero TEXT,
  ADD COLUMN IF NOT EXISTS bairro TEXT,
  ADD COLUMN IF NOT EXISTS cidade TEXT;

-- 2. Habilitar RLS na tabela usuarios (se nao estiver habilitado)
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

-- 3. Remover policies antigas da tabela usuarios (se existirem)
DROP POLICY IF EXISTS "usuarios_select_own" ON public.usuarios;
DROP POLICY IF EXISTS "usuarios_update_own" ON public.usuarios;

-- 4. Criar policies para usuarios
CREATE POLICY "usuarios_select_own"
  ON public.usuarios FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "usuarios_update_own"
  ON public.usuarios FOR UPDATE
  USING (auth.uid() = id);

-- 5. Habilitar RLS nas outras tabelas (se nao estiver habilitado)
ALTER TABLE public.anamneses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.apontamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fotos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.log_notificacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.servicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disponibilidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bloqueios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracao_temas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.formulario_templates ENABLE ROW LEVEL SECURITY;

-- 6. Policies para anamneses
DROP POLICY IF EXISTS "anamneses_select_own" ON public.anamneses;
DROP POLICY IF EXISTS "anamneses_insert_own" ON public.anamneses;
DROP POLICY IF EXISTS "anamneses_update_own" ON public.anamneses;
CREATE POLICY "anamneses_select_own" ON public.anamneses FOR SELECT USING (auth.uid() = patient_id);
CREATE POLICY "anamneses_insert_own" ON public.anamneses FOR INSERT WITH CHECK (auth.uid() = patient_id);
CREATE POLICY "anamneses_update_own" ON public.anamneses FOR UPDATE USING (auth.uid() = patient_id);

-- 7. Policies para apontamentos
DROP POLICY IF EXISTS "apontamentos_select_own" ON public.apontamentos;
DROP POLICY IF EXISTS "apontamentos_insert_own" ON public.apontamentos;
CREATE POLICY "apontamentos_select_own" ON public.apontamentos FOR SELECT USING (auth.uid() = patient_id);
CREATE POLICY "apontamentos_insert_own" ON public.apontamentos FOR INSERT WITH CHECK (auth.uid() = patient_id);

-- 8. Policies para fotos
DROP POLICY IF EXISTS "fotos_select_own" ON public.fotos;
DROP POLICY IF EXISTS "fotos_insert_own" ON public.fotos;
CREATE POLICY "fotos_select_own" ON public.fotos FOR SELECT USING (auth.uid() = patient_id);
CREATE POLICY "fotos_insert_own" ON public.fotos FOR INSERT WITH CHECK (auth.uid() = patient_id);

-- 9. Policies para log_notificacoes
DROP POLICY IF EXISTS "log_notificacoes_select_own" ON public.log_notificacoes;
CREATE POLICY "log_notificacoes_select_own" ON public.log_notificacoes FOR SELECT USING (auth.uid() = patient_id);

-- 10. Policies para tabelas publicas (servicos, disponibilidades, etc)
DROP POLICY IF EXISTS "servicos_select_auth" ON public.servicos;
CREATE POLICY "servicos_select_auth" ON public.servicos FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "disponibilidades_select_auth" ON public.disponibilidades;
CREATE POLICY "disponibilidades_select_auth" ON public.disponibilidades FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "bloqueios_select_auth" ON public.bloqueios;
CREATE POLICY "bloqueios_select_auth" ON public.bloqueios FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "temas_select_auth" ON public.configuracao_temas;
CREATE POLICY "temas_select_auth" ON public.configuracao_temas FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "templates_select_auth" ON public.formulario_templates;
CREATE POLICY "templates_select_auth" ON public.formulario_templates FOR SELECT USING (auth.role() = 'authenticated');

-- ============================================================
-- Fim da migração
-- ============================================================
