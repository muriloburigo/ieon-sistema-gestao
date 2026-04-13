'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '~/lib/supabase/client'
import PasswordStrength, { validatePassword } from '../PasswordStrength'

export default function RedefinirSenhaPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const pwdError = validatePassword(password)
    if (pwdError) { setError(`Senha fraca: ${pwdError}.`); return }
    if (password !== confirm) { setError('As senhas não coincidem.'); return }

    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError('Não foi possível redefinir a senha. O link pode ter expirado.')
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-orange rounded-sm" />
            <div className="w-6 h-8 bg-blue rounded-sm" />
          </div>
          <h1 className="text-white font-bold text-xl">Nova senha</h1>
          <p className="text-silver text-xs tracking-[0.3em] uppercase mt-1">Instituto Endurance On</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-silver mb-1.5 tracking-wider uppercase">Nova senha</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-orange transition-colors"
              placeholder="Mínimo 8 caracteres"
            />
            <PasswordStrength password={password} />
          </div>

          <div>
            <label className="block text-xs text-silver mb-1.5 tracking-wider uppercase">Confirmar nova senha</label>
            <input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
              className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-orange transition-colors"
              placeholder="••••••••"
            />
            {confirm && confirm !== password && (
              <p className="text-xs text-red-400 mt-1">As senhas não coincidem.</p>
            )}
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange hover:bg-orange/90 text-white font-semibold py-3 rounded-lg text-sm tracking-wide transition-colors disabled:opacity-50"
          >
            {loading ? 'Salvando...' : 'Salvar nova senha'}
          </button>
        </form>
      </div>
    </div>
  )
}
