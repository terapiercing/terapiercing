-- Funcao para verificar identidade do usuario (email + CPF)
-- SECURITY DEFINER permite bypass do RLS sem precisar de service role key
-- Normaliza CPF removendo pontuacao antes de comparar
CREATE OR REPLACE FUNCTION public.verify_user_identity(p_email TEXT, p_cpf TEXT)
RETURNS TABLE(user_id UUID)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT u.id FROM public.usuarios u
  WHERE LOWER(TRIM(u.email)) = LOWER(TRIM(p_email))
    AND regexp_replace(COALESCE(u.cpf, ''), '[^0-9]', '', 'g') = regexp_replace(p_cpf, '[^0-9]', '', 'g')
  LIMIT 1;
$$;
