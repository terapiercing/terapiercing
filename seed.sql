-- Seed SQL para RBClinic (Dados iniciais de exemplo)

-- 1. Inserir Serviços padrão
INSERT INTO public.servicos (id, nome, duracao_min, preco, descricao, ativo) VALUES
('b3014e7a-9774-4b53-a5c3-1c3905ef0621', 'Limpeza de Pele Profissional', 80, 150.00, 'Limpeza profunda com higienização, esfoliação, vapor de ozônio, extração de comedões, máscara calmante e hidratação.', true),
('b3014e7a-9774-4b53-a5c3-1c3905ef0622', 'Toxina Botulínica (Botox)', 45, 950.00, 'Aplicação de toxina botulínica nas três principais regiões (testa, glabela e rugas ao redor dos olhos) para suavizar marcas.', true),
('b3014e7a-9774-4b53-a5c3-1c3905ef0623', 'Preenchimento Labial', 60, 1200.00, 'Procedimento com ácido hialurônico para volumização, contorno e hidratação profunda dos lábios.', true),
('b3014e7a-9774-4b53-a5c3-1c3905ef0624', 'Peeling Químico Clareador', 50, 250.00, 'Aplicação de ácidos específicos para promover a renovação celular, tratamento de manchas, melasma e rejuvenescimento.', true),
('b3014e7a-9774-4b53-a5c3-1c3905ef0625', 'Drenagem Linfática Corporal', 60, 130.00, 'Massagem manual suave para auxiliar na eliminação de toxinas, redução de retenção de líquidos e melhora da circulação.', true),
('b3014e7a-9774-4b53-a5c3-1c3905ef0626', 'Microagulhamento com Drug Delivery', 75, 350.00, 'Indução percutânea de colágeno com agulhas finas associada a ativos rejuvenescedores e clareadores.', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Inserir Disponibilidade de Horário Semanal Padrão
-- Dia da semana: 0 = Domingo, 1 = Segunda, 2 = Terça, 3 = Quarta, 4 = Quinta, 5 = Sexta, 6 = Sábado
INSERT INTO public.disponibilidades (id, dia_semana, hora_inicio, hora_fim, ativo) VALUES
(gen_random_uuid(), 1, '08:00:00', '18:00:00', true),
(gen_random_uuid(), 2, '08:00:00', '18:00:00', true),
(gen_random_uuid(), 3, '08:00:00', '18:00:00', true),
(gen_random_uuid(), 4, '08:00:00', '18:00:00', true),
(gen_random_uuid(), 5, '08:00:00', '18:00:00', true),
(gen_random_uuid(), 6, '08:00:00', '13:00:00', true)
ON CONFLICT (id) DO NOTHING;
-- Domingo (0) permanece inativo/fechado por padrão.
