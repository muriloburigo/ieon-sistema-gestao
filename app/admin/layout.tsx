import Link from 'next/link'
import Image from 'next/image'
import {
  LayoutDashboard,
  CreditCard,
  GraduationCap,
  Link2,
  FileText,
  Users,
  ShieldCheck,
  UserCircle,
  LogOut,
} from 'lucide-react'
import { createClient, createAdminClient } from '~/lib/supabase/server'
import { redirect } from 'next/navigation'

const NAV = [
  { href: '/admin/dashboard',   label: 'Painel',             Icon: LayoutDashboard },
  { href: '/admin/assinaturas', label: 'Assinaturas',        Icon: CreditCard },
  { href: '/admin/alunos',      label: 'Alunos',             Icon: GraduationCap },
  { href: '/admin/links',       label: 'Links de Pagamento', Icon: Link2 },
  { href: '/admin/documentos',  label: 'Documentos',         Icon: FileText },
  { href: '/admin/usuarios',    label: 'Usuários',           Icon: Users },
  { href: '/admin/auditoria',   label: 'Auditoria',          Icon: ShieldCheck },
  { href: '/admin/perfil',      label: 'Meu Perfil',         Icon: UserCircle },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const adminClient = createAdminClient()
  const { data: donor } = await adminClient
    .from('donors')
    .select('name, email, is_admin')
    .eq('id', user.id)
    .single()

  if (!donor?.is_admin) redirect('/dashboard')

  const initials = donor.name?.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()

  return (
    <div className="min-h-screen bg-zinc-950 flex">
      {/* Sidebar */}
      <aside className="w-60 bg-zinc-900 border-r border-zinc-800 flex flex-col shrink-0">
        {/* Logo */}
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center">
          <Image src="/logo.png" alt="IEON" width={64} height={64} className="object-contain" />
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV.map(({ href, label, Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <Icon size={16} className="shrink-0" />
              {label}
            </Link>
          ))}
        </nav>

        {/* User */}
        <div className="px-4 py-4 border-t border-zinc-800 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-orange flex items-center justify-center text-white text-xs font-bold shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-white truncate">{donor.name}</p>
            <p className="text-xs text-zinc-500 truncate">{donor.email}</p>
          </div>
          <form action="/api/auth/logout" method="POST">
            <button className="text-zinc-500 hover:text-white transition-colors shrink-0">
              <LogOut size={14} />
            </button>
          </form>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto bg-zinc-950">
        <div className="max-w-6xl mx-auto px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
