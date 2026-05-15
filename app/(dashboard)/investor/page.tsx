import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import InvestorClient from './InvestorClient'

export default async function InvestorPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
  const { data: investor } = await supabase.from('investor').select('*').order('tanggal_investasi', { ascending: false })

  return <InvestorClient initialData={investor || []} role={profile?.role || 'mahasiswa'} />
}
