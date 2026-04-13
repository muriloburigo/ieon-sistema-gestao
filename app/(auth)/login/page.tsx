'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import Turnstile from 'react-turnstile'
import { loginAction } from './actions'

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ''
const MAX_ATTEMPTS = 5

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [blocked, setBlocked] = useState(false)
  const turnstileRef = useRef<any>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (blocked) return
    setError('')

    if (SITE_KEY && !captchaToken) {
      setError('Complete a verificação de segurança.')
      return
    }

    setLoading(true)
    const err = await loginAction(email, password, captchaToken ?? undefined)

    if (err) {
      const next = attempts + 1
      setAttempts(next)
      if (next >= MAX_ATTEMPTS) {
        setBlocked(true)
        setError(`Muitas tentativas. Aguarde alguns minutos e tente novamente.`)
      } else {
        setError(`${err} (${next}/${MAX_ATTEMPTS} tentativas)`)
      }
      turnstileRef.current?.reset()
      setCaptchaToken(null)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <div className="w-full max-w-sm">
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
              disabled={blocked}
              className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-orange transition-colors disabled:opacity-50"
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
              disabled={blocked}
              className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-orange transition-colors disabled:opacity-50"
              placeholder="••••••••"
            />
          </div>

          {SITE_KEY && !blocked && (
            <div className="flex justify-center">
              <Turnstile
                ref={turnstileRef}
                sitekey={SITE_KEY}
                theme="dark"
                onVerify={token => setCaptchaToken(token)}
                onExpire={() => setCaptchaToken(null)}
              />
            </div>
          )}

          {error && (
            <p className={`text-sm ${blocked ? 'text-orange' : 'text-red-400'}`}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || blocked}
            className="w-full bg-orange hover:bg-orange/90 text-white font-semibold py-3 rounded-lg text-sm tracking-wide transition-colors disabled:opacity-50"
          >
            {loading ? 'Entrando...' : blocked ? 'Bloqueado' : 'Entrar'}
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
