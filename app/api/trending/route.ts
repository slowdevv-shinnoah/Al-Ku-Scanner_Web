import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  const { data, error } = await supabase
    .from('analyses')
    .select('id, coupang_name, coupang_thumbnail_url, savings_percent, view_count')
    .order('view_count', { ascending: false })
    .limit(10)

  if (error) {
    return NextResponse.json({ products: [] }, { status: 500 })
  }

  return NextResponse.json(
    { products: data },
    { headers: { 'Cache-Control': 'public, max-age=60' } }
  )
}
