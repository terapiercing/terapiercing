import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const apontamentoId = searchParams.get('apontamento_id')

  if (!apontamentoId) {
    return NextResponse.json(
      { error: 'Parâmetro apontamento_id é obrigatório.' },
      { status: 400 }
    )
  }

  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('anamneses')
    .select('id, campos_json')
    .eq('apontamento_id', apontamentoId)
    .limit(1)
    .maybeSingle()

  const assinatura =
    data?.campos_json && typeof data.campos_json['_assinatura'] === 'string'
      ? data.campos_json['_assinatura']
      : null

  if (error || !assinatura) {
    return NextResponse.json(
      { error: 'Assinatura não encontrada.' },
      { status: 404 }
    )
  }

  const [meta, b64] = assinatura.split(',')
  const isPng = meta.includes('image/png')

  return new NextResponse(Buffer.from(b64, 'base64'), {
    headers: {
      'Content-Type': isPng ? 'image/png' : 'image/*',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
