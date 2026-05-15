import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PengeluaranClient from './PengeluaranClient'

export default async function PengeluaranPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
  const { data: pengeluaran } = await supabase.from('pengeluaran').select('*').order('tanggal', { ascending: false })

  return <PengeluaranClient initialData={pengeluaran || []} role={profile?.role || 'mahasiswa'} />
}
