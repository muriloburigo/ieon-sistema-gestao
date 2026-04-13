'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '~/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError('Email ou senha incorretos.')
      setLoading(false)
      return
    }

    // Check if admin
    const { data: profile } = await supabase
      .from('donors')
      .select('is_admin')
      .eq('id', data.user.id)
      .single()

    if (profile?.is_admin) {
      router.push('/admin/dashboard')
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-orange rounded-sm" />
            <div className="w-6 h-8 bg-blue rounded-sm" />
          </div>
          <p className="text-silver text-xs tracking-[0.3em] uppercase mt-2">Instituto Endurance On</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div>
            <label className="block text-xs text-silver mb-1.5 tracking-wider uppercase">Senha</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-orange transition-colors"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange hover:bg-orange/90 text-white font-semibold py-3 rounded-lg text-sm tracking-wide transition-colors disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="text-center text-zinc-500 text-xs mt-6">
          Não tem conta?{' '}
          <Link href="/cadastro" className="text-zinc-300 hover:text-white transition-colors">
            Cadastre-se
          </Link>
        </p>

        <p className="text-center text-zinc-700 text-xs mt-4">
          © {new Date().getFullYear()} Instituto Endurance On
        </p>
      </div>
    </div>
  )
}
