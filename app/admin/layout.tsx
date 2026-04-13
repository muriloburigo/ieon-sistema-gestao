import Link from 'next/link'
import { createClient } from '~/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: donor } = await supabase
    .from('donors')
    .select('name, is_admin')
    .eq('id', user.id)
    .single()

  if (!donor?.is_admin) redirect('/dashboard')

  return (
    <div className="min-h-screen bg-black flex">
      {/* Sidebar */}
      <aside className="w-56 border-r border-zinc-900 flex flex-col">
        <div className="p-6 border-b border-zinc-900">
          <div className="flex gap-1 mb-3">
            <div className="w-4 h-5 bg-orange rounded-sm" />
            <div className="w-3 h-5 bg-blue rounded-sm" />
          </div>
          <p className="text-xs text-silver tracking-widest uppercase leading-tight">Instituto<br/>Endurance On</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {[
            { href: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
            { href: '/admin/assinantes', label: 'Assinantes', icon: '👥' },
            { href: '/admin/pagamentos', label: 'Pagamentos', icon: '💳' },
            { href: '/admin/documentos', label: 'Documentos', icon: '📁' },
          ].map(({ href, label, icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
            >
              <span>{icon}</span>
              {label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-zinc-900">
          <p className="text-xs text-zinc-500 mb-2">{donor.name}</p>
          <form action="/api/auth/logout" method="POST">
            <button className="text-xs text-zinc-600 hover:text-white transition-colors">Sair</button>
          </form>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
