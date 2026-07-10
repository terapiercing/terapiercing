-- Schema SQL para RBClinic (Supabase / PostgreSQL)

-- 1. Habilitar extensão de UUID se necessário
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabela de Usuários/Pacientes (estendendo auth.users do Supabase)
CREATE TABLE IF NOT EXISTS public.usuarios (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    usuario TEXT UNIQUE,
    email TEXT NOT NULL UNIQUE,
    cpf TEXT UNIQUE,
    nascimento DATE,
    telefone TEXT NOT NULL,
    endereco TEXT,
    numero TEXT,
    bairro TEXT,
    cidade TEXT,
    role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('admin', 'client')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Tabela de Fichas de Anamnese
CREATE TABLE IF NOT EXISTS public.anamneses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE UNIQUE,
    campos_json JSONB NOT NULL,
    aceite_digital BOOLEAN DEFAULT FALSE NOT NULL,
    aceito_em TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Tabela de Serviços Oferecidos
CREATE TABLE IF NOT EXISTS public.servicos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    duracao_min INTEGER NOT NULL CHECK (duracao_min > 0),
    preco NUMERIC(10, 2) NOT NULL CHECK (preco >= 0),
    descricao TEXT,
    ativo BOOLEAN DEFAULT TRUE NOT NULL,
    exige_formulario BOOLEAN DEFAULT FALSE NOT NULL,
    formulario_recorrencia TEXT DEFAULT 'primeira_vez' CHECK (formulario_recorrencia IN ('sempre', 'primeira_vez')),
    formulario_template_id UUID REFERENCES public.formulario_templates(id)
);
CREATE TABLE IF NOT EXISTS public.formulario_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL UNIQUE,
    descricao TEXT,
    perguntas_json TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
-- 5. Tabela de Disponibilidade Semanal (Horário de Trabalho)
CREATE TABLE IF NOT EXISTS public.disponibilidades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dia_semana INTEGER NOT NULL CHECK (dia_semana BETWEEN 0 AND 6),
    hora_inicio TIME NOT NULL,
    hora_fim TIME NOT NULL,
    ativo BOOLEAN DEFAULT TRUE NOT NULL,
    CONSTRAINT chk_horas CHECK (hora_inicio < hora_fim)
);

-- 6. Tabela de Bloqueios de Agenda (Férias, Feriados, etc.)
CREATE TABLE IF NOT EXISTS public.bloqueios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    data DATE NOT NULL,
    hora_inicio TIME,
    hora_fim TIME,
    motivo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 7. Tabela de Apontamentos (Agendamentos)
CREATE TABLE IF NOT EXISTS public.apontamentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE NOT NULL,
    service_id UUID REFERENCES public.servicos(id) ON DELETE RESTRICT NOT NULL,
    data DATE NOT NULL,
    hora TIME NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pendente' CHECK (status IN ('Pendente', 'Confirmado', 'Concluido', 'Cancelado')),
    notas TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 8. Tabela de Fotos de Sessões (Antes e Depois)
CREATE TABLE IF NOT EXISTS public.fotos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE NOT NULL,
    appointment_id UUID REFERENCES public.apontamentos(id) ON DELETE SET NULL,
    url TEXT NOT NULL,
    tipo TEXT NOT NULL CHECK (tipo IN ('antes', 'depois')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 9. Tabela de Log de Notificações
CREATE TABLE IF NOT EXISTS public.log_notificacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE NOT NULL,
    tipo TEXT NOT NULL,
    enviado_em TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    status TEXT NOT NULL
);

-- 10. Tabela de Configurações Visuais e Tema
CREATE TABLE IF NOT EXISTS public.configuracao_temas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome_clinica TEXT DEFAULT 'RBClinic' NOT NULL,
    logo_url TEXT,
    cor_primaria TEXT DEFAULT '#E1A293' NOT NULL,
    cor_secundaria TEXT DEFAULT '#D4AF37' NOT NULL,
    cor_fundo TEXT DEFAULT '#FAF7F5' NOT NULL,
    cor_botoes TEXT DEFAULT '#E1A293' NOT NULL,
    fonte TEXT DEFAULT 'Playfair Display' NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Inserir tema padrão inicial
INSERT INTO public.configuracao_temas (nome_clinica, cor_primaria, cor_secundaria, cor_fundo, cor_botoes, fonte)
VALUES ('RBClinic', '#E1A293', '#D4AF37', '#FAF7F5', '#E1A293', 'Playfair Display')
ON CONFLICT DO NOTHING;

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

-- Usuarios: cada usuario so ve e edita seu proprio registro
DROP POLICY IF EXISTS "usuarios_select_own" ON public.usuarios;
CREATE POLICY "usuarios_select_own"
  ON public.usuarios FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "usuarios_update_own" ON public.usuarios;
CREATE POLICY "usuarios_update_own"
  ON public.usuarios FOR UPDATE
  USING (auth.uid() = id);

-- Anamneses
ALTER TABLE public.anamneses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anamneses_select_own" ON public.anamneses;
CREATE POLICY "anamneses_select_own"
  ON public.anamneses FOR SELECT
  USING (auth.uid() = patient_id);
DROP POLICY IF EXISTS "anamneses_insert_own" ON public.anamneses;
CREATE POLICY "anamneses_insert_own"
  ON public.anamneses FOR INSERT
  WITH CHECK (auth.uid() = patient_id);
DROP POLICY IF EXISTS "anamneses_update_own" ON public.anamneses;
CREATE POLICY "anamneses_update_own"
  ON public.anamneses FOR UPDATE
  USING (auth.uid() = patient_id);

-- Apontamentos
ALTER TABLE public.apontamentos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "apontamentos_select_own" ON public.apontamentos;
CREATE POLICY "apontamentos_select_own"
  ON public.apontamentos FOR SELECT
  USING (auth.uid() = patient_id);
DROP POLICY IF EXISTS "apontamentos_insert_own" ON public.apontamentos;
CREATE POLICY "apontamentos_insert_own"
  ON public.apontamentos FOR INSERT
  WITH CHECK (auth.uid() = patient_id);

-- Fotos
ALTER TABLE public.fotos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "fotos_select_own" ON public.fotos;
CREATE POLICY "fotos_select_own"
  ON public.fotos FOR SELECT
  USING (auth.uid() = patient_id);
DROP POLICY IF EXISTS "fotos_insert_own" ON public.fotos;
CREATE POLICY "fotos_insert_own"
  ON public.fotos FOR INSERT
  WITH CHECK (auth.uid() = patient_id);

-- Log notificacoes
ALTER TABLE public.log_notificacoes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "log_notificacoes_select_own" ON public.log_notificacoes;
CREATE POLICY "log_notificacoes_select_own"
  ON public.log_notificacoes FOR SELECT
  USING (auth.uid() = patient_id);

-- Servicos: todos autenticados podem ver
ALTER TABLE public.servicos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "servicos_select_auth" ON public.servicos;
CREATE POLICY "servicos_select_auth"
  ON public.servicos FOR SELECT
  USING (auth.role() = 'authenticated');

-- Disponibilidades: todos autenticados podem ver
ALTER TABLE public.disponibilidades ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "disponibilidades_select_auth" ON public.disponibilidades;
CREATE POLICY "disponibilidades_select_auth"
  ON public.disponibilidades FOR SELECT
  USING (auth.role() = 'authenticated');

-- Bloqueios: todos autenticados podem ver
ALTER TABLE public.bloqueios ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "bloqueios_select_auth" ON public.bloqueios;
CREATE POLICY "bloqueios_select_auth"
  ON public.bloqueios FOR SELECT
  USING (auth.role() = 'authenticated');

-- Configuracao temas: todos autenticados podem ver
ALTER TABLE public.configuracao_temas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "temas_select_auth" ON public.configuracao_temas;
CREATE POLICY "temas_select_auth"
  ON public.configuracao_temas FOR SELECT
  USING (auth.role() = 'authenticated');

-- Formulario templates: todos autenticados podem ver
ALTER TABLE public.formulario_templates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "templates_select_auth" ON public.formulario_templates;
CREATE POLICY "templates_select_auth"
  ON public.formulario_templates FOR SELECT
  USING (auth.role() = 'authenticated');
