-- Schema SQL para RBClinic (Supabase / PostgreSQL)

-- 1. Habilitar extensão de UUID se necessário
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabela de Usuários (estendendo auth.users do Supabase)
CREATE TABLE IF NOT EXISTS public.usuarios (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'client')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Tabela de Pacientes (perfil detalhado)
CREATE TABLE IF NOT EXISTS public.pacientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
    nome TEXT NOT NULL,
    cpf TEXT UNIQUE,
    nascimento DATE,
    telefone TEXT NOT NULL,
    endereco TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Tabela de Fichas de Anamnese
CREATE TABLE IF NOT EXISTS public.anamneses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.pacientes(id) ON DELETE CASCADE UNIQUE,
    campos_json JSONB NOT NULL,
    aceite_digital BOOLEAN DEFAULT FALSE NOT NULL,
    aceito_em TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. Tabela de Serviços Oferecidos
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
    perguntas_json TEXT NOT NULL, -- JSON array of question objects
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
-- 6. Tabela de Disponibilidade Semanal (Horário de Trabalho)
CREATE TABLE IF NOT EXISTS public.disponibilidades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dia_semana INTEGER NOT NULL CHECK (dia_semana BETWEEN 0 AND 6), -- 0 = Domingo, 6 = Sábado
    hora_inicio TIME NOT NULL,
    hora_fim TIME NOT NULL,
    ativo BOOLEAN DEFAULT TRUE NOT NULL,
    CONSTRAINT chk_horas CHECK (hora_inicio < hora_fim)
);

-- 7. Tabela de Bloqueios de Agenda (Férias, Feriados, etc.)
CREATE TABLE IF NOT EXISTS public.bloqueios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    data DATE NOT NULL,
    hora_inicio TIME,
    hora_fim TIME,
    motivo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 8. Tabela de Apontamentos (Agendamentos)
CREATE TABLE IF NOT EXISTS public.apontamentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.pacientes(id) ON DELETE CASCADE NOT NULL,
    service_id UUID REFERENCES public.servicos(id) ON DELETE RESTRICT NOT NULL,
    data DATE NOT NULL,
    hora TIME NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pendente' CHECK (status IN ('Pendente', 'Confirmado', 'Concluido', 'Cancelado')),
    notas TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 9. Tabela de Fotos de Sessões (Antes e Depois)
CREATE TABLE IF NOT EXISTS public.fotos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.pacientes(id) ON DELETE CASCADE NOT NULL,
    appointment_id UUID REFERENCES public.apontamentos(id) ON DELETE SET NULL,
    url TEXT NOT NULL,
    tipo TEXT NOT NULL CHECK (tipo IN ('antes', 'depois')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 10. Tabela de Log de Notificações
CREATE TABLE IF NOT EXISTS public.log_notificacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.pacientes(id) ON DELETE CASCADE NOT NULL,
    tipo TEXT NOT NULL, -- Ex: 'confirmacao', 'lembrete_24h', 'lembrete_1h', 'cancelamento'
    enviado_em TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    status TEXT NOT NULL -- Ex: 'sucesso', 'erro'
);

-- 11. Tabela de Configurações Visuais e Tema
CREATE TABLE IF NOT EXISTS public.configuracao_temas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome_clinica TEXT DEFAULT 'RBClinic' NOT NULL,
    logo_url TEXT,
    cor_primaria TEXT DEFAULT '#E1A293' NOT NULL, -- Rosa Nude
    cor_secundaria TEXT DEFAULT '#D4AF37' NOT NULL, -- Dourado Suave
    cor_fundo TEXT DEFAULT '#FAF7F5' NOT NULL, -- Off-white
    cor_botoes TEXT DEFAULT '#E1A293' NOT NULL,
    fonte TEXT DEFAULT 'Playfair Display' NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Inserir tema padrão inicial
INSERT INTO public.configuracao_temas (nome_clinica, cor_primaria, cor_secundaria, cor_fundo, cor_botoes, fonte)
VALUES ('RBClinic', '#E1A293', '#D4AF37', '#FAF7F5', '#E1A293', 'Playfair Display')
ON CONFLICT DO NOTHING;

-- Configuração do Supabase Storage
-- Recomenda-se criar um bucket chamado "clinica-fotos" para upload de imagens (antes/depois e logos)
