import Link from 'next/link'
import Image from 'next/image'
import { createClient, createAdminClient } from '~/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DonorLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()
  const { data: donor } = await admin
    .from('donors')
    .select('name, is_admin')
    .eq('id', user.id)
    .single()

  if (donor?.is_admin) redirect('/admin/dashboard')

  return (
    <div className="min-h-screen bg-black">
      {/* Top nav */}
      <header className="border-b border-zinc-900 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <Image src="/logo.png" alt="IEON" width={56} height={56} className="object-contain" />
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-zinc-400">{donor?.name}</span>
          <form action="/api/auth/logout" method="POST">
            <button className="text-xs text-zinc-500 hover:text-white transition-colors">Sair</button>
          </form>
        </div>
      </header>

      {/* Nav links */}
      <nav className="border-b border-zinc-900 px-6">
        <div className="flex gap-6">
          {[
            { href: '/dashboard', label: 'Início' },
            { href: '/historico', label: 'Histórico' },
            { href: '/transparencia', label: 'Prestação de Contas' },
            { href: '/perfil', label: 'Perfil' },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="py-3 text-sm text-zinc-400 hover:text-white border-b-2 border-transparent hover:border-orange transition-all"
            >
              {label}
            </Link>
          ))}
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  )
}
