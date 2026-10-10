-- Seed SQL para RBClinic (Dados iniciais de exemplo)

-- 1. Inserir Serviços padrão
INSERT INTO public.servicos (id, nome, duracao_min, preco, descricao, ativo) VALUES
('b3014e7a-9774-4b53-a5c3-1c3905ef0621', 'Perfuração de Lóbulo (Orelha)', 20, 60.00, 'Perfuração no lóbulo da orelha com joia de titânio grau implante e material 100% esterilizado, incluindo orientações de cuidado pós-perfuração.', true),
('b3014e7a-9774-4b53-a5c3-1c3905ef0622', 'Perfuração de Hélix (Cartilagem)', 30, 90.00, 'Perfuração na cartilagem superior da orelha com técnica precisa, joia de titânio e acompanhamento da cicatrização.', true),
('b3014e7a-9774-4b53-a5c3-1c3905ef0623', 'Perfuração de Septo', 30, 120.00, 'Perfuração no septo nasal com joia de titânio e posicionamento personalizado de acordo com o formato do seu rosto.', true),
('b3014e7a-9774-4b53-a5c3-1c3905ef0624', 'Piercing Nostril (Narina)', 30, 100.00, 'Perfuração na narina com joia de titânio, realizada com técnica precisa e higiene rigorosa.', true),
('b3014e7a-9774-4b53-a5c3-1c3905ef0625', 'Troca ou Colocação de Joia', 20, 40.00, 'Troca e ajuste de joias em piercings já cicatrizados, com avaliação da perfuração e orientação de cuidado.', true),
('b3014e7a-9774-4b53-a5c3-1c3905ef0626', 'Alargamento de Piercing (Canaleta)', 40, 80.00, 'Alargamento gradual do lóbulo com dilatadores estéreis, respeitando o tempo de cicatrização de cada pessoa.', true)
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
