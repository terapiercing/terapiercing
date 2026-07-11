-- Funcao para verificar identidade do usuario (email + CPF)
-- SECURITY DEFINER permite bypass do RLS sem precisar de service role key
CREATE OR REPLACE FUNCTION public.verify_user_identity(p_email TEXT, p_cpf TEXT)
RETURNS TABLE(user_id UUID)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT u.id FROM public.usuarios u
  WHERE u.email = p_email AND u.cpf = p_cpf
  LIMIT 1;
$$;
