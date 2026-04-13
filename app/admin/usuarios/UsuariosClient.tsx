'use client'

import { useState } from 'react'
import { createUser, toggleAdmin, deleteUser } from './actions'

export default function UsuariosClient({ users }: { users: any[] }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [actionId, setActionId] = useState<string | null>(null)
  const [error, setError] = useState('')

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const result = await createUser(new FormData(e.currentTarget))
    if (result.error) setError(result.error)
    else { setOpen(false); (e.target as HTMLFormElement).reset() }
    setLoading(false)
  }

  async function handleToggleAdmin(userId: string, current: boolean) {
    const label = current ? 'Remover permissão de admin?' : 'Dar permissão de admin?'
    if (!confirm(label)) return
    setActionId(userId)
    await toggleAdmin(userId, current)
    setActionId(null)
  }

  async function handleDelete(userId: string, name: string) {
    if (!confirm(`Excluir usuário "${name}"? Esta ação não pode ser desfeita.`)) return
    setActionId(userId)
    await deleteUser(userId)
    setActionId(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Usuários</h1>
          <p className="text-zinc-400 text-sm mt-1">Crie usuários e gerencie permissões de admin.</p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="px-4 py-2 bg-orange text-white rounded-lg text-sm font-medium hover:bg-orange/90 transition-colors"
        >
          + Novo usuário
        </button>
      </div>

      {/* Create form */}
      {open && (
        <form
          onSubmit={handleCreate}
          className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4"
        >
          <h3 className="font-semibold text-white">Novo usuário</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5 uppercase tracking-wider">Nome</label>
              <input
                name="name"
                type="text"
                required
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-orange"
                placeholder="Nome completo"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5 uppercase tracking-wider">Email</label>
              <input
                name="email"
                type="email"
                required
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-orange"
                placeholder="email@exemplo.com"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5 uppercase tracking-wider">Senha inicial</label>
              <input
                name="password"
                type="password"
                required
                minLength={8}
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-orange"
                placeholder="Mínimo 8 caracteres"
              />
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input name="is_admin" type="checkbox" value="true" className="sr-only peer" />
                  <div className="w-10 h-5 bg-zinc-700 rounded-full peer peer-checked:bg-orange transition-colors" />
                  <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5" />
                </div>
                <span className="text-sm text-zinc-300">Permissão de admin</span>
              </label>
            </div>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-orange text-white rounded-lg text-sm font-medium hover:bg-orange/90 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Criando...' : 'Criar usuário'}
            </button>
            <button
              type="button"
              onClick={() => { setOpen(false); setError('') }}
              className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-lg text-sm hover:bg-zinc-700 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-zinc-800">
          <p className="text-sm text-zinc-400">{users.length} usuário{users.length !== 1 ? 's' : ''}</p>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800">
              {['Nome', 'Email', 'Perfil', 'Cadastrado em', 'Ações'].map(h => (
                <th key={h} className="text-left px-5 py-3 text-xs text-zinc-500 uppercase tracking-wider font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {users.map((u: any) => (
              <tr key={u.id} className="hover:bg-zinc-800/30 transition-colors">
                <td className="px-5 py-4 text-sm font-medium text-white">{u.name}</td>
                <td className="px-5 py-4 text-sm text-zinc-400">{u.email}</td>
                <td className="px-5 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                    u.is_admin
                      ? 'bg-orange/10 text-orange border-orange/20'
                      : 'bg-zinc-700/50 text-zinc-400 border-zinc-600'
                  }`}>
                    {u.is_admin ? 'Admin' : 'Aluno'}
                  </span>
                </td>
                <td className="px-5 py-4 text-sm text-zinc-400">
                  {new Date(u.created_at).toLocaleDateString('pt-BR')}
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleAdmin(u.id, u.is_admin)}
                      disabled={actionId === u.id}
                      className="px-3 py-1 bg-zinc-800 text-zinc-300 text-xs rounded-lg hover:bg-zinc-700 border border-zinc-700 transition-colors disabled:opacity-50"
                    >
                      {u.is_admin ? 'Remover admin' : 'Tornar admin'}
                    </button>
                    <button
                      onClick={() => handleDelete(u.id, u.name)}
                      disabled={actionId === u.id}
                      className="px-3 py-1 bg-red-500/10 text-red-400 border border-red-500/20 text-xs rounded-lg hover:bg-red-500/20 transition-colors disabled:opacity-50"
                    >
                      Excluir
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <div className="py-12 text-center text-zinc-600 text-sm">Nenhum usuário encontrado.</div>
        )}
      </div>
    </div>
  )
}
