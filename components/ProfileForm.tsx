'use client'

import { useState } from 'react'
import { updateProfile, changePassword } from '~/lib/profile'
import PasswordStrength, { validatePassword } from '~/app/(auth)/PasswordStrength'

interface Props {
  name: string
  email: string
  whatsapp: string | null
  cpf: string | null
  isAdmin?: boolean
}

export default function ProfileForm({ name, email, whatsapp, cpf, isAdmin }: Props) {
  // ─── Personal data ──────────────────────────────────────────
  const [formName, setFormName] = useState(name)
  const [formWhatsapp, setFormWhatsapp] = useState(whatsapp ?? '')
  const [formCpf, setFormCpf] = useState(cpf ?? '')
  const [saving, setSaving] = useState(false)
  const [profileMsg, setProfileMsg] = useState<{ ok: boolean; text: string } | null>(null)

  // ─── Password ────────────────────────────────────────────────
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [changingPwd, setChangingPwd] = useState(false)
  const [pwdMsg, setPwdMsg] = useState<{ ok: boolean; text: string } | null>(null)

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    if (!formName.trim()) return
    setSaving(true)
    setProfileMsg(null)
    const err = await updateProfile({ name: formName, whatsapp: formWhatsapp, cpf: formCpf })
    setProfileMsg(err ? { ok: false, text: err } : { ok: true, text: 'Dados salvos com sucesso.' })
    setSaving(false)
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    setPwdMsg(null)
    const pwdError = validatePassword(newPassword)
    if (pwdError) { setPwdMsg({ ok: false, text: `Senha fraca: ${pwdError}.` }); return }
    if (newPassword !== confirmPassword) { setPwdMsg({ ok: false, text: 'As senhas não coincidem.' }); return }
    setChangingPwd(true)
    const err = await changePassword(newPassword)
    if (err) {
      setPwdMsg({ ok: false, text: err })
    } else {
      setPwdMsg({ ok: true, text: 'Senha alterada com sucesso.' })
      setNewPassword('')
      setConfirmPassword('')
    }
    setChangingPwd(false)
  }

  return (
    <div className="space-y-6 max-w-lg">

      {/* ─── Personal data card ─── */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Dados pessoais</h2>
          {isAdmin && (
            <span className="text-xs bg-orange/10 text-orange border border-orange/20 px-2.5 py-1 rounded-full font-semibold">
              Admin
            </span>
          )}
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          {/* Email — read only */}
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5 tracking-wider uppercase">Email</label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full bg-zinc-800/50 border border-zinc-800 text-zinc-500 rounded-lg px-4 py-2.5 text-sm cursor-not-allowed"
            />
            <p className="text-xs text-zinc-600 mt-1">O email não pode ser alterado.</p>
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5 tracking-wider uppercase">Nome completo</label>
            <input
              type="text"
              value={formName}
              onChange={e => setFormName(e.target.value)}
              required
              className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-orange transition-colors"
              placeholder="Seu nome"
            />
          </div>

          {/* WhatsApp */}
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5 tracking-wider uppercase">WhatsApp</label>
            <input
              type="tel"
              value={formWhatsapp}
              onChange={e => setFormWhatsapp(e.target.value.replace(/\D/g, '').slice(0, 11))}
              className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-orange transition-colors"
              placeholder="11999999999"
            />
          </div>

          {/* CPF */}
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5 tracking-wider uppercase">CPF</label>
            <input
              type="text"
              inputMode="numeric"
              value={formCpf}
              onChange={e => setFormCpf(e.target.value.replace(/\D/g, '').slice(0, 11))}
              className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-orange transition-colors"
              placeholder="00000000000"
            />
            <p className="text-xs text-zinc-600 mt-1">Usado para emissão de boleto / Pix.</p>
          </div>

          {profileMsg && (
            <p className={`text-sm ${profileMsg.ok ? 'text-green-400' : 'text-red-400'}`}>
              {profileMsg.text}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-orange hover:bg-orange/90 text-white font-semibold py-2.5 rounded-lg text-sm tracking-wide transition-colors disabled:opacity-50"
          >
            {saving ? 'Salvando...' : 'Salvar dados'}
          </button>
        </form>
      </div>

      {/* ─── Password card ─── */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-white uppercase tracking-wider mb-5">Alterar senha</h2>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5 tracking-wider uppercase">Nova senha</label>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              required
              className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-orange transition-colors"
              placeholder="Mínimo 8 caracteres"
            />
            <PasswordStrength password={newPassword} />
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-1.5 tracking-wider uppercase">Confirmar nova senha</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-orange transition-colors"
              placeholder="••••••••"
            />
            {confirmPassword && confirmPassword !== newPassword && (
              <p className="text-xs text-red-400 mt-1">As senhas não coincidem.</p>
            )}
          </div>

          {pwdMsg && (
            <p className={`text-sm ${pwdMsg.ok ? 'text-green-400' : 'text-red-400'}`}>
              {pwdMsg.text}
            </p>
          )}

          <button
            type="submit"
            disabled={changingPwd}
            className="w-full bg-zinc-700 hover:bg-zinc-600 text-white font-semibold py-2.5 rounded-lg text-sm tracking-wide transition-colors disabled:opacity-50"
          >
            {changingPwd ? 'Alterando...' : 'Alterar senha'}
          </button>
        </form>
      </div>

    </div>
  )
}
