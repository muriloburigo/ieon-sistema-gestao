import { createClient } from '~/lib/supabase/server'

export default async function AssinantesPage() {
  const supabase = await createClient()

  const { data: donors } = await supabase
    .from('donors')
    .select('*, subscriptions(plan_value, joined_at)')
    .eq('is_admin', false)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Assinantes</h1>
          <p className="text-zinc-400 text-sm mt-1">{donors?.length ?? 0} doadores cadastrados</p>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="text-left px-5 py-3 text-xs text-zinc-500 uppercase tracking-wider">Nome</th>
              <th className="text-left px-5 py-3 text-xs text-zinc-500 uppercase tracking-wider">Contato</th>
              <th className="text-left px-5 py-3 text-xs text-zinc-500 uppercase tracking-wider">Plano</th>
              <th className="text-left px-5 py-3 text-xs text-zinc-500 uppercase tracking-wider">Status</th>
              <th className="text-left px-5 py-3 text-xs text-zinc-500 uppercase tracking-wider">Desde</th>
            </tr>
          </thead>
          <tbody>
            {donors?.map((donor: any) => {
              const rawSub = donor.subscriptions
              const sub = rawSub ? (Array.isArray(rawSub) ? rawSub[0] : rawSub) : null
              return (
                <tr key={donor.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                  <td className="px-5 py-4">
                    <p className="text-sm font-medium text-white">{donor.name}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-xs text-zinc-400">{donor.email}</p>
                    {donor.whatsapp && <p className="text-xs text-zinc-500">{donor.whatsapp}</p>}
                  </td>
                  <td className="px-5 py-4">
                    {sub ? (
                      <span className="text-sm font-semibold text-orange">R$ {sub.plan_value}</span>
                    ) : (
                      <span className="text-xs text-zinc-600">Sem plano</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      donor.status === 'active'
                        ? 'bg-green-500/10 text-green-400'
                        : 'bg-zinc-700 text-zinc-400'
                    }`}>
                      {donor.status === 'active' ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-xs text-zinc-500">
                      {sub ? new Date(sub.joined_at).toLocaleDateString('pt-BR') : '—'}
                    </p>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
