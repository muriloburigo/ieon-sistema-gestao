'use client'

import { useState, useRef, useEffect } from 'react'
import { MoreHorizontal, ShieldCheck, ShieldOff, UserCheck, UserX, Trash2 } from 'lucide-react'
import { createUser, toggleAdmin, toggleStatus, deleteUser } from './actions'

interface Props {
  users: any[]
  currentUserId: string
}

function ActionsMenu({ u, isSelf, actionId, onToggleAdmin, onToggleStatus, onDelete }: {
  u: any
  isSelf: boolean
  actionId: string | null
  onToggleAdmin: () => void
  onToggleStatus: () => void
  onDelete: () => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const isLoading = actionId === u.id

  if (isSelf) {
    return <span className="text-xs text-zinc-600 px-2">—</span>
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        disabled={isLoading}
        className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-700 transition-colors disabled:opacity-40"
      >
        {isLoading
          ? <span className="text-xs px-1">...</span>
          : <MoreHorizontal size={16} />
        }
      </button>

      {open && (
        <div className="absolute right-0 top-8 z-10 w-48 bg-zinc-800 border border-zinc-700 rounded-xl shadow-xl overflow-hidden">
          {/* Toggle admin */}
          <button
            onClick={() => { setOpen(false); onToggleAdmin() }}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
          >
            {u.is_admin
              ? <><ShieldOff size={14} className="text-zinc-400" /> Remover admin</>
              : <><ShieldCheck size={14} className="text-orange" /> Tornar admin</>
            }
          </button>

          {/* Toggle status */}
          <button
            onClick={() => { setOpen(false); onToggleStatus() }}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
          >
            {u.status === 'active'
              ? <><UserX size={14} className="text-yellow-400" /> Inativar conta</>
              : <><UserCheck size={14} className="text-green-400" /> Reativar conta</>
            }
          </button>

          <div className="border-t border-zinc-700 my-0.5" />

          {/* Delete */}
          <button
            onClick={() => { setOpen(false); onDelete() }}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <Trash2 size={14} /> Excluir usuário
          </button>
        </div>
      )}
    </div>
  )
}

export default function UsuariosClient({ users, currentUserId }: Props) {
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

  async function handleToggleAdmin(u: any) {
    if (!confirm(u.is_admin ? 'Remover permissão de admin?' : 'Dar permissão de admin?')) return
    setActionId(u.id)
    await toggleAdmin(u.id, u.is_admin, u.name)
    setActionId(null)
  }

  async function handleToggleStatus(u: any) {
    const label = u.status === 'active' ? `Inativar "${u.name}"?` : `Reativar "${u.name}"?`
    if (!confirm(label)) return
    setActionId(u.id)
    await toggleStatus(u.id, u.status, u.name)
    setActionId(null)
  }

  async function handleDelete(u: any) {
    if (!confirm(`Excluir "${u.name}"? Esta ação não pode ser desfeita.`)) return
    setActionId(u.id)
    await deleteUser(u.id, u.name, u.email)
    setActionId(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Usuários</h1>
          <p className="text-zinc-400 text-sm mt-1">Crie usuários e gerencie permissões.</p>
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
              <input name="name" type="text" required
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-orange"
                placeholder="Nome completo" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5 uppercase tracking-wider">Email</label>
              <input name="email" type="email" required
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-orange"
                placeholder="email@exemplo.com" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5 uppercase tracking-wider">Senha inicial</label>
              <input name="password" type="password" required minLength={8}
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-orange"
                placeholder="Mínimo 8 caracteres" />
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
            <button type="submit" disabled={loading}
              className="px-4 py-2 bg-orange text-white rounded-lg text-sm font-medium hover:bg-orange/90 disabled:opacity-50 transition-colors">
              {loading ? 'Criando...' : 'Criar usuário'}
            </button>
            <button type="button" onClick={() => { setOpen(false); setError('') }}
              className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-lg text-sm hover:bg-zinc-700 transition-colors">
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
              {['Nome', 'Email', 'Perfil', 'Status', 'Cadastrado em', ''].map((h, i) => (
                <th key={i} className="text-left px-5 py-3 text-xs text-zinc-500 uppercase tracking-wider font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {users.map((u: any) => {
              const isSelf = u.id === currentUserId
              const isActive = u.status === 'active'
              return (
                <tr key={u.id} className={`hover:bg-zinc-800/30 transition-colors ${!isActive ? 'opacity-50' : ''}`}>
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
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                      isActive
                        ? 'bg-green-500/10 text-green-400 border-green-500/20'
                        : 'bg-zinc-700/50 text-zinc-500 border-zinc-600'
                    }`}>
                      {isActive ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-zinc-400">
                    {new Date(u.created_at).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <ActionsMenu
                      u={u}
                      isSelf={isSelf}
                      actionId={actionId}
                      onToggleAdmin={() => handleToggleAdmin(u)}
                      onToggleStatus={() => handleToggleStatus(u)}
                      onDelete={() => handleDelete(u)}
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {users.length === 0 && (
          <div className="py-12 text-center text-zinc-600 text-sm">Nenhum usuário encontrado.</div>
        )}
      </div>
    </div>
  )
}
