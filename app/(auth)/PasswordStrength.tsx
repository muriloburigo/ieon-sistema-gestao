'use client'

type Rule = { label: string; test: (p: string) => boolean }

const RULES: Rule[] = [
  { label: 'Mínimo 8 caracteres',        test: p => p.length >= 8 },
  { label: 'Letra maiúscula (A-Z)',       test: p => /[A-Z]/.test(p) },
  { label: 'Letra minúscula (a-z)',       test: p => /[a-z]/.test(p) },
  { label: 'Número (0-9)',                test: p => /[0-9]/.test(p) },
  { label: 'Caractere especial (!@#...)', test: p => /[^A-Za-z0-9]/.test(p) },
]

export function validatePassword(password: string): string | null {
  for (const rule of RULES) {
    if (!rule.test(password)) return rule.label
  }
  return null
}

export default function PasswordStrength({ password }: { password: string }) {
  if (!password) return null
  const passed = RULES.filter(r => r.test(password)).length
  const pct = (passed / RULES.length) * 100

  const color =
    pct <= 40 ? 'bg-red-500' :
    pct <= 60 ? 'bg-orange' :
    pct <= 80 ? 'bg-yellow-400' : 'bg-green-500'

  return (
    <div className="space-y-2 mt-1">
      <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <ul className="space-y-1">
        {RULES.map(rule => (
          <li key={rule.label} className={`flex items-center gap-1.5 text-xs transition-colors ${
            rule.test(password) ? 'text-green-400' : 'text-zinc-500'
          }`}>
            <span>{rule.test(password) ? '✓' : '○'}</span>
            {rule.label}
          </li>
        ))}
      </ul>
    </div>
  )
}
