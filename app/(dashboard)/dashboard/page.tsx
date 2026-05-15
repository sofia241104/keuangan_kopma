import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [
    { data: profile },
    { data: pemasukan },
    { data: pengeluaran },
    { data: investor },
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user!.id).maybeSingle(),
    supabase.from('pemasukan').select('*').order('tanggal', { ascending: false }),
    supabase.from('pengeluaran').select('*').order('tanggal', { ascending: false }),
    supabase.from('investor').select('*'),
  ])

  const totalPemasukan = (pemasukan || []).reduce((sum, p) => sum + p.jumlah, 0)
  const totalPengeluaran = (pengeluaran || []).reduce((sum, p) => sum + p.jumlah, 0)
  const totalInvestor = (investor || []).reduce((sum, i) => sum + i.jumlah_investasi, 0)
  const saldo = totalPemasukan - totalPengeluaran + totalInvestor

  return (
    <DashboardClient
      profile={profile}
      totalPemasukan={totalPemasukan}
      totalPengeluaran={totalPengeluaran}
      totalInvestor={totalInvestor}
      saldo={saldo}
      recentPemasukan={(pemasukan || []).slice(0, 5)}
      recentPengeluaran={(pengeluaran || []).slice(0, 5)}
      investorCount={(investor || []).length}
    />
  )
}
