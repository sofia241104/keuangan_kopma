import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import LaporanClient from './LaporanClient'

export default async function LaporanPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: pemasukan } = await supabase.from('pemasukan').select('*').order('tanggal', { ascending: true })
  const { data: pengeluaran } = await supabase.from('pengeluaran').select('*').order('tanggal', { ascending: true })
  const { data: investor } = await supabase.from('investor').select('*')

  return (
    <LaporanClient
      pemasukan={pemasukan || []}
      pengeluaran={pengeluaran || []}
      investor={investor || []}
    />
  )
}
