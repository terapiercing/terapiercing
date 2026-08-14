'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { isThemeId } from '@/lib/themes'

export async function upsertServico(
  _prevState: { error: string; success?: boolean } | undefined,
  formData: FormData
) {
  const supabase = await createClient()

  const id = formData.get('id') as string
  const nome = formData.get('nome') as string
  const descricao = formData.get('descricao') as string
  const preco = Number(formData.get('preco'))
  const duracao_min = Number(formData.get('duracao_min'))
  const exige_formulario = formData.get('exige_formulario') === 'on'
  const formulario_recorrencia = formData.get('formulario_recorrencia') as string
  const ativo = formData.get('ativo') === 'on'

  if (!nome || isNaN(preco) || isNaN(duracao_min) || preco < 0 || duracao_min <= 0) {
    return { error: 'Preencha todos os campos obrigatórios com valores válidos.' }
  }

// Updated payload to include formulario_template_id if provided
  const templateId = formData.get('formulario_template_id') as string;
  const payload: any = {
    nome,
    descricao: descricao || null,
    preco,
    duracao_min,
    exige_formulario,
    formulario_recorrencia: exige_formulario ? formulario_recorrencia : 'primeira_vez',
    ativo,
    ...(templateId ? { formulario_template_id: templateId } : {}),
  };

  let error;
  if (id) {
    const { error: err } = await supabase
      .from('servicos')
      .update(payload)
      .eq('id', id)
    error = err
  } else {
    const { error: err } = await supabase
      .from('servicos')
      .insert(payload)
    error = err
  }

  if (error) {
    return { error: `Erro ao salvar serviço: ${error.message}` }
  }

  revalidatePath('/admin/configuracoes')
  revalidatePath('/')
  return { success: true, error: '' }
}

export async function updateConfiguracao(
  _prevState: { error: string; success?: boolean } | undefined,
  formData: FormData
) {
  const supabase = await createClient()

  const nomeClinica = ((formData.get('nome_clinica') as string) || '').trim()
  const tema = formData.get('tema') as string

  if (!nomeClinica) {
    return { error: 'Informe o nome da clínica.' }
  }

  if (!isThemeId(tema)) {
    return { error: 'Tema inválido. Selecione uma das opções disponíveis.' }
  }

  const { data: existing } = await supabase
    .from('configuracao_temas')
    .select('id')
    .limit(1)
    .maybeSingle()

  const payload = { nome_clinica: nomeClinica, tema }

  let error
  if (existing?.id) {
    const { error: err } = await supabase
      .from('configuracao_temas')
      .update(payload)
      .eq('id', existing.id)
    error = err
  } else {
    const { error: err } = await supabase
      .from('configuracao_temas')
      .insert(payload)
    error = err
  }

  if (error) {
    return { error: `Erro ao salvar configuração: ${error.message}` }
  }

  revalidatePath('/', 'layout')
  return { success: true, error: '' }
}

export async function listTemplates() {
  const supabase = await createClient();
  const { data, error } = await supabase.from('formulario_templates').select('id, nome, descricao');
  if (error) throw error;
  return data;
}

export async function createTemplate(_prevState: any, formData: FormData) {
  const supabase = await createClient();
  const nome = formData.get('nome') as string;
  const descricao = formData.get('descricao') as string;
  const perguntasJson = formData.get('perguntas_json') as string;
  const { error } = await supabase.from('formulario_templates').insert({ nome, descricao, perguntas_json: perguntasJson });
  if (error) return { error: error.message };
  revalidatePath('/admin/configuracoes');
  return { success: true };
}

export async function updateTemplate(_prevState: any, formData: FormData) {
  const supabase = await createClient();
  const id = formData.get('id') as string;
  const nome = formData.get('nome') as string;
  const descricao = formData.get('descricao') as string;
  const perguntasJson = formData.get('perguntas_json') as string;
  const { error } = await supabase.from('formulario_templates').update({ nome, descricao, perguntas_json: perguntasJson }).eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/admin/configuracoes');
  return { success: true };
}

export async function deleteTemplate(_prevState: any, formData: FormData) {
  const supabase = await createClient();
  const id = formData.get('id') as string;
  const { error } = await supabase.from('formulario_templates').delete().eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/admin/configuracoes');
  return { success: true };
}

export async function deleteServico(servicoId: string) {
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
    return { error: 'Apenas administradores podem excluir serviços.' }
  }

  const { count } = await supabase
    .from('apontamentos')
    .select('*', { count: 'exact', head: true })
    .eq('service_id', servicoId)

  if (count && count > 0) {
    return { error: 'Não é possível excluir um serviço que possui agendamentos vinculados. Desative-o ao invés de excluir.' }
  }

  const { error } = await supabase
    .from('servicos')
    .delete()
    .eq('id', servicoId)

  if (error) {
    return { error: `Erro ao excluir serviço: ${error.message}` }
  }

  revalidatePath('/admin/configuracoes')
  return { success: true, error: '' }
}

export async function updateDisponibilidades(
  _prevState: { error: string; success?: boolean } | undefined,
  data: { id?: string; dia_semana: number; hora_inicio: string; hora_fim: string; ativo: boolean }[]
) {
  const supabase = await createClient()

  for (const item of data) {
    const payload = {
      dia_semana: item.dia_semana,
      hora_inicio: item.hora_inicio.includes(':') && item.hora_inicio.split(':').length === 2 ? `${item.hora_inicio}:00` : item.hora_inicio,
      hora_fim: item.hora_fim.includes(':') && item.hora_fim.split(':').length === 2 ? `${item.hora_fim}:00` : item.hora_fim,
      ativo: item.ativo,
    }

    let error;
    if (item.id) {
      const { error: err } = await supabase
        .from('disponibilidades')
        .update(payload)
        .eq('id', item.id)
      error = err
    } else {
      const { error: err } = await supabase
        .from('disponibilidades')
        .insert(payload)
      error = err
    }

    if (error) {
      return { error: `Erro ao salvar horários: ${error.message}` }
    }
  }

  revalidatePath('/admin/configuracoes')
  revalidatePath('/')
  return { success: true, error: '' }
}
