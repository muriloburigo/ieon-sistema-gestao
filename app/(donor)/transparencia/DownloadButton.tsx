'use client'

import { useState } from 'react'

export default function DownloadButton({ url, filename }: { url: string; filename: string }) {
  const [loading, setLoading] = useState(false)

  async function handleDownload() {
    setLoading(true)
    try {
      const res = await fetch(url)
      const blob = await res.blob()
      const ext = url.split('.').pop()?.split('?')[0] ?? ''
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `${filename}.${ext}`
      a.click()
      URL.revokeObjectURL(a.href)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="px-3 py-1.5 bg-orange/10 text-orange border border-orange/20 rounded-lg text-xs hover:bg-orange/20 transition-colors disabled:opacity-50"
    >
      {loading ? '...' : '↓ Baixar'}
    </button>
  )
}
