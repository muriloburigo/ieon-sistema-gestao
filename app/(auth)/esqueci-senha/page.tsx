'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '~/lib/supabase/client'

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?token_hash=&type=recovery&next=/redefinir-senha`,
    })

    if (error) {
      setError('Não foi possível enviar o email. Verifique o endereço e tente novamente.')
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-orange rounded-sm" />
            <div className="w-6 h-8 bg-blue rounded-sm" />
          </div>
          <h1 className="text-white font-bold text-xl">Recuperar senha</h1>
          <p className="text-silver text-xs tracking-[0.3em] uppercase mt-1">Instituto Endurance On</p>
        </div>

        {sent ? (
          <div className="text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto text-2xl">
              ✓
            </div>
            <p className="text-white font-medium">Email enviado!</p>
            <p className="text-zinc-400 text-sm">
              Verifique a caixa de entrada de <span className="text-white">{email}</span> e clique no link para redefinir sua senha.
            </p>
            <p className="text-zinc-600 text-xs mt-4">Não recebeu? Verifique a pasta de spam.</p>
            <Link href="/login" className="block text-zinc-400 hover:text-white text-sm transition-colors mt-6">
              ← Voltar ao login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-zinc-400 text-sm text-center mb-6">
              Informe seu email e enviaremos um link para redefinir sua senha.
            </p>
            <div>
              <label className="block text-xs text-silver mb-1.5 tracking-wider uppercase">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-orange transition-colors"
                placeholder="seu@email.com"
              />
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange hover:bg-orange/90 text-white font-semibold py-3 rounded-lg text-sm tracking-wide transition-colors disabled:opacity-50"
            >
              {loading ? 'Enviando...' : 'Enviar link de recuperação'}
            </button>

            <Link href="/login" className="block text-center text-zinc-500 hover:text-zinc-300 text-sm transition-colors">
              ← Voltar ao login
            </Link>
          </form>
        )}
      </div>
    </div>
  )
}
