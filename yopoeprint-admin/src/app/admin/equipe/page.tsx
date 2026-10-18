'use client'

import { useCallback, useEffect, useState } from 'react'
import { UserPlus, Loader2 } from 'lucide-react'
import { adminAuthService } from '@/lib/auth-admin.service'
import { platformService, TeamMember, Role, ROLE_LABELS, ROLE_HINTS } from '@/lib/platform.service'

const input = 'w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-mid'
const EMPTY = { firstName: '', lastName: '', email: '', phone: '', password: '', role: 'staff' as Role }

export default function EquipePage() {
  const me = adminAuthService.getCurrentUser()
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState(EMPTY)
  const [creating, setCreating] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setMembers(await platformService.listTeam())
      setError('')
    } catch (e: any) {
      setError(e?.message || 'Impossible de charger l\'équipe')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const create = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    setError('')
    try {
      await platformService.createMember({ ...form, phone: form.phone || undefined })
      setForm(EMPTY)
      setShowForm(false)
      await load()
    } catch (err: any) {
      setError(err?.message || 'Création impossible')
    } finally {
      setCreating(false)
    }
  }

  const act = async (id: string, fn: () => Promise<unknown>, confirmText: string) => {
    if (!window.confirm(confirmText)) return
    setBusyId(id)
    setError('')
    try {
      await fn()
      await load()
    } catch (err: any) {
      setError(err?.message || 'Action impossible')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="max-w-5xl space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="text-sm text-gray-600 space-y-0.5">
          {(Object.keys(ROLE_HINTS) as Role[]).map((r) => (
            <p key={r}><strong className="text-gray-900">{ROLE_LABELS[r]}</strong> : {ROLE_HINTS[r]}</p>
          ))}
        </div>
        <button onClick={() => setShowForm((s) => !s)}
          className="inline-flex items-center gap-2 bg-blue-deep text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-mid shrink-0">
          <UserPlus size={16} /> Ajouter un membre
        </button>
      </div>

      {error && <div role="alert" className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>}

      {showForm && (
        <form onSubmit={create} className="bg-white border border-gray-100 rounded-2xl shadow-card p-5 grid sm:grid-cols-2 gap-3">
          <label className="text-xs font-semibold text-gray-700 space-y-1"><span>Prénom *</span>
            <input required className={input} value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} /></label>
          <label className="text-xs font-semibold text-gray-700 space-y-1"><span>Nom *</span>
            <input required className={input} value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} /></label>
          <label className="text-xs font-semibold text-gray-700 space-y-1"><span>Email *</span>
            <input required type="email" className={input} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
          <label className="text-xs font-semibold text-gray-700 space-y-1"><span>Téléphone</span>
            <input type="tel" className={input} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
          <label className="text-xs font-semibold text-gray-700 space-y-1"><span>Mot de passe provisoire * (10 caractères min.)</span>
            <input required minLength={10} type="password" autoComplete="new-password" className={input} value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>
          <label className="text-xs font-semibold text-gray-700 space-y-1"><span>Rôle *</span>
            <select className={input} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as Role })}>
              {(Object.keys(ROLE_HINTS) as Role[]).map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
            </select></label>
          <div className="sm:col-span-2 flex justify-end gap-2">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold">Annuler</button>
            <button type="submit" disabled={creating} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-deep text-white text-sm font-bold disabled:opacity-60">
              {creating && <Loader2 size={14} className="animate-spin" />} Créer le compte
            </button>
          </div>
        </form>
      )}

      <div className="bg-white border border-gray-100 rounded-2xl shadow-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">
              <th className="px-5 py-3">Membre</th><th className="px-5 py-3">Rôle</th><th className="px-5 py-3">Statut</th><th className="px-5 py-3">Depuis</th><th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-gray-500">Chargement…</td></tr>
            ) : members.map((m) => {
              const isMe = m.id === me?.id
              return (
                <tr key={m.id} className={m.isActive ? '' : 'opacity-60'}>
                  <td className="px-5 py-3">
                    <p className="font-semibold text-gray-900">{m.firstName} {m.lastName}{isMe && <span className="text-xs text-gray-500"> (vous)</span>}</p>
                    <p className="text-xs text-gray-600">{m.email}</p>
                  </td>
                  <td className="px-5 py-3">
                    <select value={m.role} disabled={isMe || busyId === m.id} aria-label={`Rôle de ${m.firstName}`}
                      onChange={(e) => {
                        const role = e.target.value as Role | 'client'
                        act(m.id, () => platformService.setRole(m.id, role),
                          role === 'client' ? `Retirer ${m.firstName} de l'équipe ? Son compte redevient un compte client.` : `Passer ${m.firstName} en « ${ROLE_LABELS[role]} » ?`)
                      }}
                      className="px-2 py-1.5 border border-gray-200 rounded-lg text-sm bg-white disabled:bg-gray-50">
                      {(Object.keys(ROLE_HINTS) as Role[]).map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                      <option value="client">Retirer de l&apos;équipe</option>
                    </select>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${m.isActive ? 'bg-emerald-50 text-emerald-800' : 'bg-gray-100 text-gray-700'}`}>
                      {m.isActive ? 'Actif' : 'Désactivé'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-xs text-gray-600">{new Date(m.createdAt).toLocaleDateString('fr-FR')}</td>
                  <td className="px-5 py-3 text-right">
                    {!isMe && (
                      <button disabled={busyId === m.id}
                        onClick={() => act(m.id, () => platformService.setActive(m.id, !m.isActive),
                          m.isActive ? `Désactiver le compte de ${m.firstName} ? Ses sessions seront coupées.` : `Réactiver le compte de ${m.firstName} ?`)}
                        className="text-xs font-bold text-blue-mid hover:underline disabled:opacity-50">
                        {m.isActive ? 'Désactiver' : 'Réactiver'}
                      </button>
                    )}
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
