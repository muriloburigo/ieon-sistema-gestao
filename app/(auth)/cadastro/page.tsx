'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '~/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function CadastroPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password !== confirm) { setError('As senhas não coincidem.'); return }
    if (password.length < 6) { setError('A senha deve ter pelo menos 6 caracteres.'); return }

    setLoading(true)
    const supabase = createClient()
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    })

    if (signUpError) {
      setError(signUpError.message)
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
          <h1 className="text-white font-bold text-xl">Criar conta</h1>
          <p className="text-silver text-xs tracking-[0.3em] uppercase mt-1">Instituto Endurance On</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-silver mb-1.5 tracking-wider uppercase">Nome completo</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-orange transition-colors"
              placeholder="Seu nome"
            />
          </div>
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
              placeholder="Mínimo 6 caracteres"
            />
          </div>
          <div>
            <label className="block text-xs text-silver mb-1.5 tracking-wider uppercase">Confirmar senha</label>
            <input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
              className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-orange transition-colors"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange hover:bg-orange/90 text-white font-semibold py-3 rounded-lg text-sm tracking-wide transition-colors disabled:opacity-50"
          >
            {loading ? 'Criando conta...' : 'Criar conta'}
          </button>
        </form>

        <p className="text-center text-zinc-500 text-xs mt-6">
          Já tem conta?{' '}
          <Link href="/login" className="text-zinc-300 hover:text-white transition-colors">
            Entrar
          </Link>
        </p>

        <p className="text-center text-zinc-700 text-xs mt-4">
          © {new Date().getFullYear()} Instituto Endurance On
        </p>
      </div>
    </div>
  )
}
