import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PemasukanClient from './PemasukanClient'

export default async function PemasukanPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
  const { data: pemasukan } = await supabase.from('pemasukan').select('*').order('tanggal', { ascending: false })

  return <PemasukanClient initialData={pemasukan || []} role={profile?.role || 'mahasiswa'} />
}
