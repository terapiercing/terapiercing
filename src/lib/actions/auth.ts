'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'

export async function login(
  _prevState: { error: string } | undefined,
  formData: FormData
) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    return { error: error.message }
  }

  const redirectTo = (formData.get('redirectTo') as string) || '/dashboard'

  revalidatePath('/', 'layout')
  redirect(redirectTo)
}

export async function signup(
  _prevState: { error: string } | undefined,
  formData: FormData
) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const nome = formData.get('nome') as string
  const telefone = formData.get('telefone') as string
  const cpf = formData.get('cpf') as string
  const nascimento = formData.get('nascimento') as string
  const endereco = formData.get('endereco') as string

  if (!email || !password || !nome || !telefone) {
    return { error: 'Preencha todos os campos obrigatórios (Nome, E-mail, Senha e Telefone).' }
  }

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  })

  if (authError) {
    return { error: authError.message }
  }

  const user = authData.user

  if (user) {
    // 1. Inserir na tabela de usuarios
    const { error: userError } = await supabase
      .from('usuarios')
      .insert({
        id: user.id,
        email: user.email!,
        role: 'client',
      })

    if (userError) {
      return { error: `Erro ao criar perfil de usuário: ${userError.message}` }
    }

    // 2. Inserir na tabela de pacientes
    const { error: pacienteError } = await supabase
      .from('pacientes')
      .insert({
        user_id: user.id,
        nome,
        telefone,
        cpf: cpf || null,
        nascimento: nascimento || null,
        endereco: endereco || null,
      })

    if (pacienteError) {
      // Tentar limpar o usuario criado no public.usuarios caso dê erro no paciente
      await supabase.from('usuarios').delete().eq('id', user.id)
      return { error: `Erro ao cadastrar dados do paciente: ${pacienteError.message}` }
    }
  }

  const redirectTo = (formData.get('redirectTo') as string) || '/dashboard'

  revalidatePath('/', 'layout')
  redirect(redirectTo)
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}

export async function getSession() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getSession()
  return data.session
}
