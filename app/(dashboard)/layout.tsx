import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/Sidebar'
import type { Profile } from '@/types'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  let { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  // Auto-create jika profile belum ada (user dibuat sebelum trigger dipasang)
  if (!profile) {
    const { data: created } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        email: user.email ?? '',
        full_name: user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? 'Pengguna',
        role: 'mahasiswa',
      }, { onConflict: 'id' })
      .select()
      .maybeSingle()
    profile = created
  }

  // Fallback agar tidak redirect loop jika DB bermasalah
  const safeProfile: Profile = profile ?? {
    id: user.id,
    email: user.email ?? '',
    full_name: user.email?.split('@')[0] ?? 'Pengguna',
    role: 'mahasiswa',
    created_at: new Date().toISOString(),
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar profile={safeProfile} />
      <main style={{ flex: 1, overflow: 'auto', background: '#f8fafc' }}>
        {children}
      </main>
    </div>
  )
}
