'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

function isCpf(value: string): boolean {
  return /^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/.test(value)
}

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function onlyDigits(value: string): string {
  return value.replace(/\D/g, '')
}

export async function login(
  _prevState: { error: string } | undefined,
  formData: FormData
) {
  const supabase = await createClient()

  const identifier = (formData.get('email') as string).trim()
  const password = formData.get('password') as string

  let email = identifier

  if (isCpf(identifier)) {
    const cpfDigits = onlyDigits(identifier)
    const { data: usuario } = await supabase
      .from('usuarios')
      .select('email')
      .eq('cpf', cpfDigits)
      .single()

    if (!usuario) {
      return { error: 'CPF não encontrado no sistema.' }
    }
    email = usuario.email
  } else if (!isEmail(identifier)) {
    const { data: usuario } = await supabase
      .from('usuarios')
      .select('email')
      .eq('usuario', identifier)
      .single()

    if (!usuario) {
      return { error: 'Usuário não encontrado no sistema.' }
    }
    email = usuario.email
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

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
  const usuario = formData.get('usuario') as string
  const telefone = formData.get('telefone') as string
  const cpf = (formData.get('cpf') as string).replace(/\D/g, '')
  const nascimento = formData.get('nascimento') as string
  const endereco = formData.get('endereco') as string
  const numero = formData.get('numero') as string
  const bairro = formData.get('bairro') as string
  const cidade = formData.get('cidade') as string

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
    const supabaseAdmin = createAdminClient()
    const { error: userError } = await supabaseAdmin
      .from('usuarios')
      .insert({
        id: user.id,
        email: user.email!,
        nome,
        usuario: usuario || null,
        telefone,
        cpf: cpf || null,
        nascimento: nascimento || null,
        endereco: endereco || null,
        numero: numero || null,
        bairro: bairro || null,
        cidade: cidade || null,
        role: 'client',
      })

    if (userError) {
      return { error: `Erro ao criar perfil: ${userError.message}` }
    }
  }

  const redirectTo = (formData.get('redirectTo') as string) || '/dashboard'

  revalidatePath('/', 'layout')
  redirect(redirectTo)
}

  export interface NovoClienteResult {
  error: string
  success?: boolean
  cliente?: {
    id: string
    nome: string
    email: string
    telefone: string
    cpf: string | null
  }
}

export async function cadastrarCliente(
  _prevState: NovoClienteResult | undefined,
  formData: FormData
): Promise<NovoClienteResult> {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  const caller = userData.user

  if (!caller) {
    return { error: 'Usuário não autenticado.' }
  }

  const { data: callerProfile } = await supabase
    .from('usuarios')
    .select('role')
    .eq('id', caller.id)
    .single()

  if (callerProfile?.role !== 'admin') {
    return { error: 'Apenas administradores podem cadastrar clientes.' }
  }

  const email = (formData.get('email') as string).trim()
  const password = formData.get('password') as string
  const nome = formData.get('nome') as string
  const usuario = formData.get('usuario') as string
  const telefone = formData.get('telefone') as string
  const cpf = (formData.get('cpf') as string).replace(/\D/g, '')
  const nascimento = formData.get('nascimento') as string
  const endereco = formData.get('endereco') as string
  const numero = formData.get('numero') as string
  const bairro = formData.get('bairro') as string
  const cidade = formData.get('cidade') as string

  if (!email || !password || !nome || !telefone) {
    return { error: 'Preencha todos os campos obrigatórios (Nome, E-mail, Senha e Telefone).' }
  }

  const supabaseAdmin = createAdminClient()

  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (authError) {
    return { error: authError.message }
  }

  const user = authData.user

  if (user) {
    const { error: userError } = await supabaseAdmin
      .from('usuarios')
      .insert({
        id: user.id,
        email: user.email!,
        nome,
        usuario: usuario || null,
        telefone,
        cpf: cpf || null,
        nascimento: nascimento || null,
        endereco: endereco || null,
        numero: numero || null,
        bairro: bairro || null,
        cidade: cidade || null,
        role: 'client',
      })

    if (userError) {
      return { error: `Erro ao criar perfil: ${userError.message}` }
    }

    revalidatePath('/clientes')
    revalidatePath('/agendamentos/novo')
    return {
      success: true,
      error: '',
      cliente: {
        id: user.id,
        nome,
        email,
        telefone,
        cpf: cpf || null,
      },
    }
  }

  return { error: 'Erro inesperado ao criar usuário.' }
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

export async function updateProfile(
  _prevState: { error: string; success?: boolean } | undefined,
  formData: FormData
) {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  const user = userData.user

  if (!user) {
    return { error: 'Usuário não autenticado.' }
  }

  const nome = formData.get('nome') as string
  const usuario = formData.get('usuario') as string
  const telefone = formData.get('telefone') as string
  const cpf = (formData.get('cpf') as string).replace(/\D/g, '')
  const nascimento = formData.get('nascimento') as string
  const endereco = formData.get('endereco') as string
  const numero = formData.get('numero') as string
  const bairro = formData.get('bairro') as string
  const cidade = formData.get('cidade') as string

  if (!nome || !telefone) {
    return { error: 'Nome e Telefone são obrigatórios.' }
  }

  const { data: usuarioData } = await supabase
    .from('usuarios')
    .select('role')
    .eq('id', user.id)
    .single()

  const isAdmin = usuarioData?.role === 'admin'

  const updatePayload: Record<string, string | null> = {
    nome,
    usuario: usuario || null,
    telefone,
    cpf: cpf || null,
    nascimento: nascimento || null,
    endereco: endereco || null,
    numero: numero || null,
    bairro: bairro || null,
    cidade: cidade || null,
  }

  if (isAdmin) {
    const role = formData.get('role') as string
    if (role) {
      updatePayload.role = role
    }
  }

  const { error: updateError } = await supabase
    .from('usuarios')
    .update(updatePayload)
    .eq('id', user.id)

  if (updateError) {
    return { error: `Erro ao atualizar perfil: ${updateError.message}` }
  }

  const newEmail = formData.get('new_email') as string
  if (newEmail && newEmail !== user.email) {
    const { error: emailError } = await supabase.auth.updateUser({
      email: newEmail,
    })
    if (emailError) {
      return { error: `Erro ao atualizar email: ${emailError.message}` }
    }

    await supabase
      .from('usuarios')
      .update({ email: newEmail })
      .eq('id', user.id)
  }

  revalidatePath('/perfil')
  return { success: true, error: '' }
}

export async function changePassword(
  _prevState: { error: string; success?: boolean } | undefined,
  formData: FormData
) {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  const user = userData.user

  if (!user) {
    return { error: 'Usuário não autenticado.' }
  }

  const currentPassword = formData.get('current_password') as string
  const newPassword = formData.get('new_password') as string
  const confirmPassword = formData.get('confirm_password') as string

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { error: 'Preencha todos os campos de senha.' }
  }

  if (newPassword !== confirmPassword) {
    return { error: 'A nova senha e a confirmação não conferem.' }
  }

  if (newPassword.length < 6) {
    return { error: 'A nova senha deve ter no mínimo 6 caracteres.' }
  }

  const { error: authError } = await supabase.auth.signInWithPassword({
    email: user.email!,
    password: currentPassword,
  })

  if (authError) {
    return { error: 'Senha atual incorreta.' }
  }

  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (updateError) {
    return { error: `Erro ao alterar senha: ${updateError.message}` }
  }

  return { success: true, error: '' }
}

export async function forgotPassword(
  _prevState: { error: string; success?: boolean } | undefined,
  formData: FormData
) {
  const supabaseAdmin = createAdminClient()

  const cpf = (formData.get('cpf') as string).replace(/\D/g, '')

  if (!cpf) {
    return { error: 'Informe seu CPF.' }
  }

  const { data: usuario } = await supabaseAdmin
    .from('usuarios')
    .select('email')
    .eq('cpf', cpf)
    .single()

  if (!usuario) {
    return { error: 'CPF não encontrado no sistema.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(usuario.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('.supabase.co', '')}/reset-password`,
  })

  if (error) {
    return { error: `Erro ao enviar email de recuperação: ${error.message}` }
  }

  return { success: true, error: '' }
}

export async function verifyResetIdentity(
  _prevState: { error: string; verified?: boolean; userId?: string } | undefined,
  formData: FormData
) {
  const supabase = await createClient()

  const email = (formData.get('email') as string || '').trim()
  const cpf = (formData.get('cpf') as string || '').replace(/\D/g, '')

  if (!email || !cpf) {
    return { error: 'Informe seu e-mail e CPF.' }
  }

  const { data, error: rpcError } = await supabase.rpc('verify_user_identity', {
    p_email: email,
    p_cpf: cpf,
  })

  if (rpcError) {
    console.error('[verifyResetIdentity] RPC error:', rpcError)
    return { error: 'Erro ao verificar identidade. Tente novamente.' }
  }

  if (!data || data.length === 0) {
    return { error: 'E-mail e CPF não conferem no sistema.' }
  }

  return { error: '', verified: true, userId: data[0].user_id }
}

export async function resetPasswordDirect(
  _prevState: { error: string; success?: boolean } | undefined,
  formData: FormData
) {
  try {
    const supabase = await createClient()

    const userId = formData.get('userId') as string
    const newPassword = formData.get('new_password') as string
    const confirmPassword = formData.get('confirm_password') as string

    if (!userId || !newPassword || !confirmPassword) {
      return { error: 'Preencha todos os campos.' }
    }

    if (newPassword !== confirmPassword) {
      return { error: 'A nova senha e a confirmação não conferem.' }
    }

    if (newPassword.length < 6) {
      return { error: 'A nova senha deve ter no mínimo 6 caracteres.' }
    }

    const supabaseAdmin = createAdminClient()

    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: newPassword,
    })

    if (error) {
      return { error: `Erro ao redefinir senha: ${error.message}` }
    }

    return { success: true, error: '' }
  } catch {
    return { error: 'Erro ao redefinir senha. Tente novamente.' }
  }
}

export async function toggleUserRole(
  userId: string,
  newRole: 'admin' | 'client'
) {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  const caller = userData.user

  if (!caller) {
    return { error: 'Usuário não autenticado.' }
  }

  const { data: callerProfile } = await supabase
    .from('usuarios')
    .select('role')
    .eq('id', caller.id)
    .single()

  if (callerProfile?.role !== 'admin') {
    return { error: 'Apenas administradores podem alterar roles.' }
  }

  if (userId === caller.id) {
    return { error: 'Você não pode alterar sua própria role.' }
  }

  const { error: updateError } = await supabase
    .from('usuarios')
    .update({ role: newRole })
    .eq('id', userId)

  if (updateError) {
    return { error: `Erro ao alterar role: ${updateError.message}` }
  }

  revalidatePath('/clientes')
  return { success: true, error: '' }
}

export async function updateUsuario(
  _prevState: { error: string; success?: boolean } | undefined,
  formData: FormData
) {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  const caller = userData.user

  if (!caller) {
    return { error: 'Usuário não autenticado.' }
  }

  const { data: callerProfile } = await supabase
    .from('usuarios')
    .select('role')
    .eq('id', caller.id)
    .single()

  if (callerProfile?.role !== 'admin') {
    return { error: 'Apenas administradores podem editar outros usuários.' }
  }

  const userId = formData.get('userId') as string
  const nome = formData.get('nome') as string
  const usuario = formData.get('usuario') as string
  const telefone = formData.get('telefone') as string
  const cpf = (formData.get('cpf') as string).replace(/\D/g, '')
  const nascimento = formData.get('nascimento') as string
  const endereco = formData.get('endereco') as string
  const numero = formData.get('numero') as string
  const bairro = formData.get('bairro') as string
  const cidade = formData.get('cidade') as string
  const role = formData.get('role') as string

  if (!userId || !nome || !telefone) {
    return { error: 'Nome e Telefone são obrigatórios.' }
  }

  const { error } = await supabase
    .from('usuarios')
    .update({
      nome,
      usuario: usuario || null,
      telefone,
      cpf: cpf || null,
      nascimento: nascimento || null,
      endereco: endereco || null,
      numero: numero || null,
      bairro: bairro || null,
      cidade: cidade || null,
      role: role || 'client',
    })
    .eq('id', userId)

  if (error) {
    return { error: `Erro ao atualizar: ${error.message}` }
  }

  revalidatePath('/clientes')
  return { success: true, error: '' }
}

export interface HistoricoCliente {
  totalAtendimentos: number
  atendimentosPorStatus: {
    Pendente: number
    Confirmado: number
    Concluido: number
    Cancelado: number
  }
  procedimentos: Array<{
    nome: string
    quantidade: number
    ultimaData: string
  }>
  formularios: Array<{
    id: string
    servicoNome: string | null
    templateNome: string | null
    camposJson: Record<string, unknown>
    aceiteDigital: boolean
    criadoEm: string
    aceitoEm: string | null
  }>
}

export async function getHistoricoCliente(
  patientId: string
): Promise<{ data: HistoricoCliente | null; error: string }> {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  const caller = userData.user

  if (!caller) {
    return { data: null, error: 'Usuário não autenticado.' }
  }

  const { data: callerProfile } = await supabase
    .from('usuarios')
    .select('role')
    .eq('id', caller.id)
    .single()

  if (callerProfile?.role !== 'admin') {
    return { data: null, error: 'Apenas administradores podem acessar o histórico.' }
  }

  const { data: apontamentos } = await supabase
    .from('apontamentos')
    .select('id, status, data, servicos(nome)')
    .eq('patient_id', patientId)

  const totalAtendimentos = apontamentos?.length ?? 0

  const atendimentosPorStatus = {
    Pendente: 0,
    Confirmado: 0,
    Concluido: 0,
    Cancelado: 0,
  }

  const procedimentosMap = new Map<string, { quantidade: number; ultimaData: string }>()

  for (const apt of apontamentos ?? []) {
    if (apt.status in atendimentosPorStatus) {
      atendimentosPorStatus[apt.status as keyof typeof atendimentosPorStatus]++
    }

    const servico = apt.servicos as unknown as { nome: string } | null
    const nomeServico = servico?.nome ?? 'Serviço removido'
    const existing = procedimentosMap.get(nomeServico)
    if (existing) {
      existing.quantidade++
      if (apt.data > existing.ultimaData) {
        existing.ultimaData = apt.data
      }
    } else {
      procedimentosMap.set(nomeServico, { quantidade: 1, ultimaData: apt.data })
    }
  }

  const procedimentos = Array.from(procedimentosMap.entries())
    .map(([nome, info]) => ({ nome, ...info }))
    .sort((a, b) => b.quantidade - a.quantidade)

  const { data: anamneses } = await supabase
    .from('anamneses')
    .select('id, campos_json, aceite_digital, aceito_em, created_at, servicos(nome), formulario_templates(nome)')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false })

  const formularios = (anamneses ?? []).map((an) => ({
    id: an.id,
    servicoNome: (an.servicos as unknown as { nome: string } | null)?.nome ?? null,
    templateNome: (an.formulario_templates as unknown as { nome: string } | null)?.nome ?? null,
    camposJson: an.campos_json as Record<string, unknown>,
    aceiteDigital: an.aceite_digital,
    criadoEm: an.created_at,
    aceitoEm: an.aceito_em as string | null,
  }))

  return {
    data: {
      totalAtendimentos,
      atendimentosPorStatus,
      procedimentos,
      formularios,
    },
    error: '',
  }
}
