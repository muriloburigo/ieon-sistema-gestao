'use client'

import { useState } from 'react'
import { createClient } from '~/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Props {
  paymentId: string
  status: string
  whatsappLink: string | null
  donorEmail?: string
}

export default function PaymentActions({ paymentId, status, whatsappLink, donorEmail }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function markAsPaid() {
    setLoading(true)
    const supabase = createClient()
    await supabase
      .from('payments')
      .update({ status: 'paid', paid_at: new Date().toISOString() })
      .eq('id', paymentId)
    router.refresh()
    setLoading(false)
  }

  return (
    <div className="flex items-center gap-2 shrink-0">
      {whatsappLink && status === 'pending' && (
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1.5 bg-green-600/10 text-green-400 border border-green-500/20 rounded-lg text-xs font-medium hover:bg-green-600/20 transition-colors"
        >
          WhatsApp
        </a>
      )}
      {status === 'pending' && (
        <button
          onClick={markAsPaid}
          disabled={loading}
          className="px-3 py-1.5 bg-orange/10 text-orange border border-orange/20 rounded-lg text-xs font-medium hover:bg-orange/20 transition-colors disabled:opacity-50"
        >
          {loading ? '...' : 'Dar Baixa'}
        </button>
      )}
    </div>
  )
}
