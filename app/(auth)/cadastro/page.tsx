'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '~/lib/supabase/client'

const PLANS = [
  { value: 5,   label: 'R$ 5,00 / mês',   description: 'Plano Básico' },
  { value: 10,  label: 'R$ 10,00 / mês',  description: 'Plano Apoiador' },
  { value: 15,  label: 'R$ 15,00 / mês',  description: 'Plano Parceiro' },
  { value: 50,  label: 'R$ 50,00 / mês',  description: 'Plano Patrono' },
  { value: 100, label: 'R$ 100,00 / mês', description: 'Plano Embaixador' },
]

export default function CadastroPage() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [plan, setPlan] = useState<number>(10)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (step === 1) {
      if (password !== confirm) { setError('As senhas não coincidem.'); return }
      if (password.length < 6) { setError('A senha deve ter pelo menos 6 caracteres.'); return }
      setStep(2)
      return
    }

    setLoading(true)
    const supabase = createClient()

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    if (data.user) {
      // Update donor name and create subscription
      await supabase.from('donors').update({ name }).eq('id', data.user.id)
      await supabase.from('subscriptions').insert({
        donor_id: data.user.id,
        plan_value: plan,
        status: 'active',
        joined_at: new Date().toISOString(),
      })
    }

    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-orange rounded-sm" />
            <div className="w-6 h-8 bg-blue rounded-sm" />
          </div>
          <h1 className="text-white font-bold text-xl">Seja um Apoiador</h1>
          <p className="text-silver text-xs tracking-[0.3em] uppercase mt-1">Instituto Endurance On</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2].map(s => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                step >= s ? 'bg-orange text-white' : 'bg-zinc-800 text-zinc-500'
              }`}>{s}</div>
              <span className={`text-xs ${step >= s ? 'text-white' : 'text-zinc-600'}`}>
                {s === 1 ? 'Seus dados' : 'Escolha o plano'}
              </span>
              {s < 2 && <div className={`flex-1 h-px ${step > s ? 'bg-orange' : 'bg-zinc-800'}`} />}
            </div>
          ))}
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          {step === 1 ? (
            <>
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
            </>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-zinc-400 mb-2">Escolha o valor da sua contribuição mensal:</p>
              {PLANS.map(p => (
                <label
                  key={p.value}
                  className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-colors ${
                    plan === p.value
                      ? 'border-orange bg-orange/5'
                      : 'border-zinc-800 bg-zinc-900 hover:border-zinc-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="plan"
                    value={p.value}
                    checked={plan === p.value}
                    onChange={() => setPlan(p.value)}
                    className="accent-orange"
                  />
                  <div className="flex-1">
                    <p className="text-white font-semibold text-sm">{p.label}</p>
                    <p className="text-zinc-500 text-xs">{p.description}</p>
                  </div>
                  {plan === p.value && (
                    <span className="text-orange text-xs font-bold">✓</span>
                  )}
                </label>
              ))}
            </div>
          )}

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="flex gap-3 pt-2">
            {step === 2 && (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold py-3 rounded-lg text-sm transition-colors"
              >
                ← Voltar
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-orange hover:bg-orange/90 text-white font-semibold py-3 rounded-lg text-sm tracking-wide transition-colors disabled:opacity-50"
            >
              {loading ? 'Criando conta...' : step === 1 ? 'Continuar →' : 'Criar conta'}
            </button>
          </div>
        </form>

        <p className="text-center text-zinc-600 text-xs mt-8">
          Já tem conta?{' '}
          <Link href="/login" className="text-zinc-400 hover:text-white transition-colors">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  )
}
