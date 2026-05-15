'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types'

const navItems = [
  { href: '/dashboard', icon: '📊', label: 'Dashboard' },
  { href: '/pemasukan', icon: '💰', label: 'Pemasukan' },
  { href: '/pengeluaran', icon: '💸', label: 'Pengeluaran' },
  { href: '/investor', icon: '🤝', label: 'Investor' },
  { href: '/laporan', icon: '📋', label: 'Laporan' },
]

export default function Sidebar({ profile }: { profile: Profile }) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside style={{
      width: '260px',
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      borderRight: '1px solid rgba(255,255,255,0.06)',
    }}>
      {/* Logo */}
      <div style={{
        padding: '24px 20px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            flexShrink: 0,
          }}>
            🏛️
          </div>
          <div>
            <div style={{ color: 'white', fontWeight: '700', fontSize: '15px' }}>KOPMA Finance</div>
            <div style={{ color: '#64748b', fontSize: '11px' }}>Koperasi Mahasiswa</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '16px 12px' }}>
        <div style={{ color: '#475569', fontSize: '11px', fontWeight: '600', padding: '0 8px', marginBottom: '8px', letterSpacing: '0.05em' }}>
          MENU UTAMA
        </div>
        {navItems.map(item => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '11px 12px',
                borderRadius: '10px',
                marginBottom: '4px',
                textDecoration: 'none',
                background: isActive ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                border: isActive ? '1px solid rgba(59, 130, 246, 0.25)' : '1px solid transparent',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => {
                if (!isActive) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'
              }}
              onMouseLeave={e => {
                if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent'
              }}
            >
              <span style={{ fontSize: '18px' }}>{item.icon}</span>
              <span style={{
                fontSize: '14px',
                fontWeight: isActive ? '600' : '400',
                color: isActive ? '#60a5fa' : '#94a3b8',
              }}>
                {item.label}
              </span>
              {isActive && (
                <div style={{
                  marginLeft: 'auto',
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: '#3b82f6',
                }} />
              )}
            </Link>
          )
        })}
      </nav>

      {/* User Profile & Logout */}
      <div style={{
        padding: '12px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          borderRadius: '10px',
          padding: '12px',
          marginBottom: '8px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: '700',
              fontSize: '14px',
              flexShrink: 0,
            }}>
              {profile.full_name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{
                color: 'white',
                fontSize: '13px',
                fontWeight: '500',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                {profile.full_name || 'Pengguna'}
              </div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '1px 8px',
                borderRadius: '20px',
                fontSize: '10px',
                fontWeight: '600',
                background: profile.role === 'admin' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                color: profile.role === 'admin' ? '#60a5fa' : '#34d399',
              }}>
                {profile.role === 'admin' ? '⚡ Admin' : '👤 Mahasiswa'}
              </div>
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            padding: '10px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '8px',
            color: '#f87171',
            fontSize: '13px',
            fontWeight: '500',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = 'rgba(239, 68, 68, 0.2)'
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = 'rgba(239, 68, 68, 0.1)'
          }}
        >
          🚪 Keluar
        </button>
      </div>
    </aside>
  )
}
