'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatRupiah, formatDate } from '@/lib/utils'
import type { Pengeluaran, Role } from '@/types'

const KATEGORI = ['Operasional', 'Gaji', 'Pembelian', 'Transportasi', 'Utilitas', 'Lainnya']

interface Props {
  initialData: Pengeluaran[]
  role: Role
}

function Modal({ onClose, onSave, editData }: {
  onClose: () => void
  onSave: (data: Omit<Pengeluaran, 'id' | 'created_by' | 'created_at'>) => void
  editData?: Pengeluaran
}) {
  const [form, setForm] = useState({
    tanggal: editData?.tanggal?.split('T')[0] || new Date().toISOString().split('T')[0],
    keterangan: editData?.keterangan || '',
    kategori: editData?.kategori || KATEGORI[0],
    jumlah: editData?.jumlah?.toString() || '',
  })

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b' }}>
            {editData ? '✏️ Edit Pengeluaran' : '➕ Tambah Pengeluaran'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#94a3b8' }}>✕</button>
        </div>
        <form onSubmit={e => { e.preventDefault(); onSave({ ...form, jumlah: Number(form.jumlah) }) }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div><label>Tanggal</label><input type="date" value={form.tanggal} onChange={e => setForm(f => ({ ...f, tanggal: e.target.value }))} required /></div>
            <div><label>Keterangan</label><input type="text" placeholder="Masukkan keterangan..." value={form.keterangan} onChange={e => setForm(f => ({ ...f, keterangan: e.target.value }))} required /></div>
            <div><label>Kategori</label><select value={form.kategori} onChange={e => setForm(f => ({ ...f, kategori: e.target.value }))}>
              {KATEGORI.map(k => <option key={k} value={k}>{k}</option>)}
            </select></div>
            <div><label>Jumlah (Rp)</label><input type="number" placeholder="0" min="1" value={form.jumlah} onChange={e => setForm(f => ({ ...f, jumlah: e.target.value }))} required /></div>
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

export default function PengeluaranClient({ initialData, role }: Props) {
  const [data, setData] = useState<Pengeluaran[]>(initialData)
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState<Pengeluaran | undefined>()
  const [search, setSearch] = useState('')
  const supabase = createClient()

  const isAdmin = role === 'admin'
  const filtered = data.filter(d =>
    d.keterangan.toLowerCase().includes(search.toLowerCase()) ||
    d.kategori.toLowerCase().includes(search.toLowerCase())
  )
  const total = filtered.reduce((s, d) => s + d.jumlah, 0)

  async function handleSave(form: Omit<Pengeluaran, 'id' | 'created_by' | 'created_at'>) {
    if (editItem) {
      const { data: updated } = await supabase.from('pengeluaran').update(form).eq('id', editItem.id).select().single()
      if (updated) setData(d => d.map(x => x.id === editItem.id ? updated : x))
    } else {
      const { data: created } = await supabase.from('pengeluaran').insert(form).select().single()
      if (created) setData(d => [created, ...d])
    }
    setShowModal(false)
    setEditItem(undefined)
  }

  async function handleDelete(id: string) {
    if (!confirm('Yakin ingin menghapus data ini?')) return
    await supabase.from('pengeluaran').delete().eq('id', id)
    setData(d => d.filter(x => x.id !== id))
  }

  return (
    <div style={{ padding: '28px 32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', marginBottom: '4px' }}>💸 Pengeluaran</h1>
          <p style={{ color: '#64748b', fontSize: '14px' }}>Kelola data pengeluaran koperasi</p>
        </div>
        {isAdmin && (
          <button className="btn-primary" onClick={() => { setEditItem(undefined); setShowModal(true) }}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            ➕ Tambah Pengeluaran
          </button>
        )}
      </div>

      <div style={{
        background: 'linear-gradient(135deg, #ef4444, #dc2626)',
        borderRadius: '16px', padding: '20px 24px', marginBottom: '20px', color: 'white',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div>
          <div style={{ fontSize: '13px', opacity: 0.85, marginBottom: '4px' }}>Total Pengeluaran</div>
          <div style={{ fontSize: '26px', fontWeight: '700' }}>{formatRupiah(total)}</div>
        </div>
        <div style={{ fontSize: '40px', opacity: 0.4 }}>💸</div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <input type="text" placeholder="🔍 Cari keterangan atau kategori..."
          value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: '360px' }} />
      </div>

      <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table>
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>Keterangan</th>
              <th>Kategori</th>
              <th style={{ textAlign: 'right' }}>Jumlah</th>
              {isAdmin && <th style={{ textAlign: 'center' }}>Aksi</th>}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={isAdmin ? 5 : 4} style={{ textAlign: 'center', padding: '48px', color: '#94a3b8' }}>
                Belum ada data pengeluaran
              </td></tr>
            ) : filtered.map(item => (
              <tr key={item.id}>
                <td style={{ color: '#64748b', fontSize: '13px' }}>{formatDate(item.tanggal)}</td>
                <td style={{ fontWeight: '500' }}>{item.keterangan}</td>
                <td><span className="badge badge-red">{item.kategori}</span></td>
                <td style={{ textAlign: 'right', fontWeight: '600', color: '#ef4444' }}>{formatRupiah(item.jumlah)}</td>
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
