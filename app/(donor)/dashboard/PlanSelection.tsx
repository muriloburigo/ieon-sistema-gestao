'use client'

import { useState } from 'react'

const PLAN_VALUES = [5, 10, 15, 50, 100]

interface Props {
  hasCpf: boolean
  asaasEnabled: boolean
}

export default function PlanSelection({ hasCpf, asaasEnabled }: Props) {
  const [loading, setLoading] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null)
  const [cpf, setCpf] = useState('')
  const [error, setError] = useState('')

  // ─── Asaas flow ─────────────────────────────────────────────
  async function subscribeViaAsaas(planValue: number, cpfValue?: string) {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/asaas/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan_value: planValue, cpf: cpfValue }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Erro ao processar. Tente novamente.')
        setLoading(false)
        return
      }
      // Redirect to Asaas hosted checkout
      window.location.href = data.paymentUrl
    } catch {
      setError('Erro de conexão. Tente novamente.')
      setLoading(false)
    }
  }

  function handlePlanClick(value: number) {
    if (loading) return
    if (!asaasEnabled) {
      // Fallback: legacy direct-DB form submit
      const form = document.getElementById(`form-plan-${value}`) as HTMLFormElement
      form?.submit()
      return
    }
    if (!hasCpf) {
      setSelectedPlan(value)
    } else {
      subscribeViaAsaas(value)
    }
  }

  // ─── CPF collection step ──────────────────────────────────────
  if (asaasEnabled && selectedPlan && !hasCpf) {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Confirmar plano</h2>
          <p className="text-zinc-400 text-sm mt-1">
            Plano selecionado:{' '}
            <span className="text-white font-semibold">R$ {selectedPlan}/mês</span>
          </p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
          <p className="text-zinc-400 text-sm">
            Precisamos do seu CPF para emissão do boleto / Pix.
          </p>
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5 tracking-wider uppercase">CPF</label>
            <input
              type="text"
              inputMode="numeric"
              value={cpf}
              onChange={e => setCpf(e.target.value.replace(/\D/g, '').slice(0, 11))}
              placeholder="00000000000"
              className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-orange transition-colors"
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button
              onClick={() => { setSelectedPlan(null); setError('') }}
              className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-3 rounded-lg text-sm transition-colors"
            >
              Voltar
            </button>
            <button
              onClick={() => subscribeViaAsaas(selectedPlan, cpf)}
              disabled={loading || cpf.length !== 11}
              className="flex-1 bg-orange hover:bg-orange/90 text-white font-semibold py-3 rounded-lg text-sm transition-colors disabled:opacity-50"
            >
              {loading ? 'Processando...' : 'Ir para pagamento →'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ─── Plan grid ────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-white">Escolha seu plano</h2>
        <p className="text-zinc-400 text-sm mt-1">Selecione o valor da sua contribuição mensal.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {PLAN_VALUES.map(value => (
          <div key={value}>
            {/* Legacy hidden form (used only when Asaas is not configured) */}
            {!asaasEnabled && (
              <form id={`form-plan-${value}`} action="/api/donor/subscribe" method="POST" className="hidden">
                <input type="hidden" name="plan_value" value={value} />
              </form>
            )}
            <button
              type="button"
              onClick={() => handlePlanClick(value)}
              disabled={loading}
              className="w-full bg-zinc-900 border border-zinc-800 hover:border-orange rounded-xl p-4 text-center transition-colors group disabled:opacity-50"
            >
              <p className="text-xl font-bold text-white group-hover:text-orange transition-colors">
                R$ {value}
              </p>
              <p className="text-xs text-zinc-500 mt-1">/mês</p>
            </button>
          </div>
        ))}
      </div>

      {loading && (
        <p className="text-zinc-400 text-sm text-center animate-pulse">
          Preparando pagamento...
        </p>
      )}

      {error && <p className="text-red-400 text-sm">{error}</p>}
    </div>
  )
}
