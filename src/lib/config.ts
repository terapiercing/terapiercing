import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { isThemeId } from '@/lib/themes'
import { DEFAULT_CONFIG, type AppConfig } from '@/lib/config-shared'

export type { AppConfig }

export const getConfiguracao = cache(async (): Promise<AppConfig> => {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('configuracao_temas')
      .select('nome_clinica, tema')
      .limit(1)
      .maybeSingle()

    if (!data) return DEFAULT_CONFIG

    return {
      nomeClinica: data.nome_clinica || DEFAULT_CONFIG.nomeClinica,
      tema: isThemeId(data.tema) ? data.tema : DEFAULT_CONFIG.tema,
    }
  } catch {
    return DEFAULT_CONFIG
  }
})
