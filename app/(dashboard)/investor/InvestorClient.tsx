'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatRupiah, formatDate } from '@/lib/utils'
import type { Investor, Role } from '@/types'

interface Props {
  initialData: Investor[]
  role: Role
}

function Modal({ onClose, onSave, editData }: {
  onClose: () => void
  onSave: (data: Omit<Investor, 'id' | 'created_at'>) => void
  editData?: Investor
}) {
  const [form, setForm] = useState({
    nama: editData?.nama || '',
    email: editData?.email || '',
    telepon: editData?.telepon || '',
    jumlah_investasi: editData?.jumlah_investasi?.toString() || '',
    tanggal_investasi: editData?.tanggal_investasi?.split('T')[0] || new Date().toISOString().split('T')[0],
    status: (editData?.status || 'aktif') as 'aktif' | 'tidak_aktif',
    keterangan: editData?.keterangan || '',
  })

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b' }}>
            {editData ? '✏️ Edit Investor' : '➕ Tambah Investor'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>✕</button>
        </div>
        <form onSubmit={e => { e.preventDefault(); onSave({ ...form, jumlah_investasi: Number(form.jumlah_investasi) }) }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div><label>Nama Lengkap</label><input type="text" placeholder="Nama investor..." value={form.nama} onChange={e => setForm(f => ({ ...f, nama: e.target.value }))} required /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div><label>Email</label><input type="email" placeholder="email@..." value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
              <div><label>Telepon</label><input type="text" placeholder="08xx..." value={form.telepon} onChange={e => setForm(f => ({ ...f, telepon: e.target.value }))} /></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div><label>Jumlah Investasi (Rp)</label><input type="number" min="1" placeholder="0" value={form.jumlah_investasi} onChange={e => setForm(f => ({ ...f, jumlah_investasi: e.target.value }))} required /></div>
              <div><label>Tanggal Investasi</label><input type="date" value={form.tanggal_investasi} onChange={e => setForm(f => ({ ...f, tanggal_investasi: e.target.value }))} required /></div>
            </div>
            <div><label>Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as 'aktif' | 'tidak_aktif' }))}>
                <option value="aktif">Aktif</option>
                <option value="tidak_aktif">Tidak Aktif</option>
              </select>
            </div>
            <div><label>Keterangan</label><textarea placeholder="Catatan tambahan..." value={form.keterangan} onChange={e => setForm(f => ({ ...f, keterangan: e.target.value }))} style={{ minHeight: '80px' }} /></div>
            <div style={{ display: 'flex', gap: '10px', paddingTop: '8px' }}>
              <button type="button" onClick={onClose} className="btn-secondary" style={{ flex: 1 }}>Batal</button>
              <button type="submit" className="btn-primary" style={{ flex: 1 }}>Simpan</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function InvestorClient({ initialData, role }: Props) {
  const [data, setData] = useState<Investor[]>(initialData)
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState<Investor | undefined>()
  const [search, setSearch] = useState('')
  const supabase = createClient()

  const isAdmin = role === 'admin'
  const filtered = data.filter(d => d.nama.toLowerCase().includes(search.toLowerCase()))
  const totalInvestasi = data.filter(d => d.status === 'aktif').reduce((s, d) => s + d.jumlah_investasi, 0)
  const investorAktif = data.filter(d => d.status === 'aktif').length

  async function handleSave(form: Omit<Investor, 'id' | 'created_at'>) {
    if (editItem) {
      const { data: updated } = await supabase.from('investor').update(form).eq('id', editItem.id).select().single()
      if (updated) setData(d => d.map(x => x.id === editItem.id ? updated : x))
    } else {
      const { data: created } = await supabase.from('investor').insert(form).select().single()
      if (created) setData(d => [created, ...d])
    }
    setShowModal(false)
    setEditItem(undefined)
  }

  async function handleDelete(id: string) {
    if (!confirm('Yakin ingin menghapus data investor ini?')) return
    await supabase.from('investor').delete().eq('id', id)
    setData(d => d.filter(x => x.id !== id))
  }

  return (
    <div style={{ padding: '28px 32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', marginBottom: '4px' }}>🤝 Investor</h1>
          <p style={{ color: '#64748b', fontSize: '14px' }}>Kelola data investor koperasi</p>
        </div>
        {isAdmin && (
          <button className="btn-primary" onClick={() => { setEditItem(undefined); setShowModal(true) }}>
            ➕ Tambah Investor
          </button>
        )}
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
        {[
          { label: 'Total Investasi Aktif', value: formatRupiah(totalInvestasi), color: '#8b5cf6', icon: '💼' },
          { label: 'Investor Aktif', value: `${investorAktif} Orang`, color: '#10b981', icon: '✅' },
          { label: 'Total Investor', value: `${data.length} Orang`, color: '#3b82f6', icon: '👥' },
        ].map(item => (
          <div key={item.label} style={{
            background: 'white', borderRadius: '14px', padding: '18px 20px',
            border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '14px',
          }}>
            <div style={{
              width: '42px', height: '42px', borderRadius: '10px',
              background: item.color + '18',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px',
            }}>{item.icon}</div>
            <div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>{item.label}</div>
              <div style={{ fontSize: '17px', fontWeight: '700', color: '#1e293b' }}>{item.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: '16px' }}>
        <input type="text" placeholder="🔍 Cari nama investor..."
          value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: '360px' }} />
      </div>

      <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table>
          <thead>
            <tr>
              <th>Nama</th>
              <th>Kontak</th>
              <th>Jumlah Investasi</th>
              <th>Tanggal</th>
              <th>Status</th>
              {isAdmin && <th style={{ textAlign: 'center' }}>Aksi</th>}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={isAdmin ? 6 : 5} style={{ textAlign: 'center', padding: '48px', color: '#94a3b8' }}>
                Belum ada data investor
              </td></tr>
            ) : filtered.map(item => (
              <tr key={item.id}>
                <td>
                  <div style={{ fontWeight: '600', color: '#1e293b' }}>{item.nama}</div>
                  {item.keterangan && <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>{item.keterangan}</div>}
                </td>
                <td>
                  <div style={{ fontSize: '13px' }}>{item.email || '-'}</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>{item.telepon || '-'}</div>
                </td>
                <td style={{ fontWeight: '600', color: '#8b5cf6' }}>{formatRupiah(item.jumlah_investasi)}</td>
                <td style={{ color: '#64748b', fontSize: '13px' }}>{formatDate(item.tanggal_investasi)}</td>
                <td>
                  <span className={`badge ${item.status === 'aktif' ? 'badge-green' : 'badge-red'}`}>
                    {item.status === 'aktif' ? '✅ Aktif' : '❌ Tidak Aktif'}
                  </span>
                </td>
                {isAdmin && (
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                      <button className="btn-secondary" onClick={() => { setEditItem(item); setShowModal(true) }}
                        style={{ padding: '4px 10px', fontSize: '12px' }}>Edit</button>
                      <button className="btn-danger" onClick={() => handleDelete(item.id)}
                        style={{ padding: '4px 10px', fontSize: '12px' }}>Hapus</button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <Modal onClose={() => { setShowModal(false); setEditItem(undefined) }} onSave={handleSave} editData={editItem} />
      )}
    </div>
  )
}
