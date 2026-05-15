'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatRupiah, formatDate } from '@/lib/utils'
import type { Pemasukan, Role } from '@/types'

const KATEGORI = ['Iuran Anggota', 'Penjualan', 'Jasa', 'Donasi', 'Lainnya']

interface Props {
  initialData: Pemasukan[]
  role: Role
}

function Modal({ onClose, onSave, editData }: {
  onClose: () => void
  onSave: (data: Omit<Pemasukan, 'id' | 'created_by' | 'created_at'>) => void
  editData?: Pemasukan
}) {
  const [form, setForm] = useState({
    tanggal: editData?.tanggal?.split('T')[0] || new Date().toISOString().split('T')[0],
    keterangan: editData?.keterangan || '',
    kategori: editData?.kategori || KATEGORI[0],
    jumlah: editData?.jumlah?.toString() || '',
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSave({ ...form, jumlah: Number(form.jumlah) })
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b' }}>
            {editData ? '✏️ Edit Pemasukan' : '➕ Tambah Pemasukan'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#94a3b8' }}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label>Tanggal</label>
              <input type="date" value={form.tanggal} onChange={e => setForm(f => ({ ...f, tanggal: e.target.value }))} required />
            </div>
            <div>
              <label>Keterangan</label>
              <input type="text" placeholder="Masukkan keterangan..." value={form.keterangan} onChange={e => setForm(f => ({ ...f, keterangan: e.target.value }))} required />
            </div>
            <div>
              <label>Kategori</label>
              <select value={form.kategori} onChange={e => setForm(f => ({ ...f, kategori: e.target.value }))}>
                {KATEGORI.map(k => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>
            <div>
              <label>Jumlah (Rp)</label>
              <input type="number" placeholder="0" min="1" value={form.jumlah} onChange={e => setForm(f => ({ ...f, jumlah: e.target.value }))} required />
            </div>
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

export default function PemasukanClient({ initialData, role }: Props) {
  const [data, setData] = useState<Pemasukan[]>(initialData)
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState<Pemasukan | undefined>()
  const [search, setSearch] = useState('')
  const supabase = createClient()

  const isAdmin = role === 'admin'
  const filtered = data.filter(d =>
    d.keterangan.toLowerCase().includes(search.toLowerCase()) ||
    d.kategori.toLowerCase().includes(search.toLowerCase())
  )
  const total = filtered.reduce((s, d) => s + d.jumlah, 0)

  async function handleSave(form: Omit<Pemasukan, 'id' | 'created_by' | 'created_at'>) {
    if (editItem) {
      const { data: updated } = await supabase
        .from('pemasukan').update(form).eq('id', editItem.id).select().single()
      if (updated) setData(d => d.map(x => x.id === editItem.id ? updated : x))
    } else {
      const { data: created } = await supabase
        .from('pemasukan').insert(form).select().single()
      if (created) setData(d => [created, ...d])
    }
    setShowModal(false)
    setEditItem(undefined)
  }

  async function handleDelete(id: string) {
    if (!confirm('Yakin ingin menghapus data ini?')) return
    await supabase.from('pemasukan').delete().eq('id', id)
    setData(d => d.filter(x => x.id !== id))
  }

  return (
    <div style={{ padding: '28px 32px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', marginBottom: '4px' }}>
            💰 Pemasukan
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px' }}>Kelola data pemasukan koperasi</p>
        </div>
        {isAdmin && (
          <button className="btn-primary" onClick={() => { setEditItem(undefined); setShowModal(true) }}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            ➕ Tambah Pemasukan
          </button>
        )}
      </div>

      {/* Summary Card */}
      <div style={{
        background: 'linear-gradient(135deg, #10b981, #059669)',
        borderRadius: '16px',
        padding: '20px 24px',
        marginBottom: '20px',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div>
          <div style={{ fontSize: '13px', opacity: 0.85, marginBottom: '4px' }}>Total Pemasukan</div>
          <div style={{ fontSize: '26px', fontWeight: '700' }}>{formatRupiah(total)}</div>
        </div>
        <div style={{ fontSize: '40px', opacity: 0.4 }}>💰</div>
      </div>

      {/* Search */}
      <div style={{ marginBottom: '16px' }}>
        <input
          type="text"
          placeholder="🔍 Cari keterangan atau kategori..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: '360px' }}
        />
      </div>

      {/* Table */}
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
              <tr>
                <td colSpan={isAdmin ? 5 : 4} style={{ textAlign: 'center', padding: '48px', color: '#94a3b8' }}>
                  Belum ada data pemasukan
                </td>
              </tr>
            ) : (
              filtered.map(item => (
                <tr key={item.id}>
                  <td style={{ color: '#64748b', fontSize: '13px' }}>{formatDate(item.tanggal)}</td>
                  <td style={{ fontWeight: '500' }}>{item.keterangan}</td>
                  <td>
                    <span className="badge badge-green">{item.kategori}</span>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: '600', color: '#10b981' }}>
                    {formatRupiah(item.jumlah)}
                  </td>
                  {isAdmin && (
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                        <button
                          className="btn-secondary"
                          onClick={() => { setEditItem(item); setShowModal(true) }}
                          style={{ padding: '4px 10px', fontSize: '12px' }}
                        >
                          Edit
                        </button>
                        <button className="btn-danger" onClick={() => handleDelete(item.id)}
                          style={{ padding: '4px 10px', fontSize: '12px' }}>
                          Hapus
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <Modal
          onClose={() => { setShowModal(false); setEditItem(undefined) }}
          onSave={handleSave}
          editData={editItem}
        />
      )}
    </div>
  )
}
