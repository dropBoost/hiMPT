// src/components/ButtonDeleteRow.jsx
'use client'

import { useState } from 'react'
import { deleteRowUUID } from '@/lib/deleteSup'

export default function ButtonDeleteRow({
  uuid,
  tabella,
  nomeAttributo,
  icona,
  className = '',
  onDeleted,
  confirmMessage,
}) {
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!uuid || !tabella || !nomeAttributo) return console.error('Parametri mancanti')
    if (confirmMessage && !window.confirm(confirmMessage)) return

    setLoading(true)
    const ok = await deleteRowUUID(uuid, tabella, nomeAttributo)
    setLoading(false)

    if (ok) {
      onDeleted?.(uuid)
      alert('Riga eliminata!')
    } else {
      alert('Errore durante la cancellazione.')
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      aria-busy={loading}
      className={className}
    >
      {icona ?? (loading ? 'Elimino…' : 'Elimina')}
    </button>
  )
}
