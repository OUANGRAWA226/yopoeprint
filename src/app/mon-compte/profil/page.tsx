'use client'

import { useState, useEffect } from 'react'
import { useAuthContext } from '@/context/AuthContext'
import { api } from '@/lib'
import { Eye, EyeOff, User, Lock, Mail, Phone, ShieldCheck } from 'lucide-react'
import { Alert } from '@/components/ui/Alert'

const inputCls = "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary focus:bg-white transition-all placeholder:text-gray-400"

export default function ProfilPage() {
  const { user, refreshUser } = useAuthContext()
  const [tab, setTab] = useState<'info' | 'password'>('info')
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // ── Formulaire infos personnelles ─────────────────────────
  const [info, setInfo] = useState({
    firstName: '', lastName: '', email: '', phone: ''
  })

  useEffect(() => {
    if (user) setInfo({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: user.phone || '',
    })
  }, [user])

  const saveInfo = async () => {
    setLoading(true); setSuccess(''); setError('')
    try {
      await api.patch('/users/me', info)
      await refreshUser()
      setSuccess('Vos informations ont été mises à jour avec succès.')
    } catch (e: any) {
      setError(e?.message || 'Une erreur est survenue.')
    } finally {
      setLoading(false)
      setTimeout(() => setSuccess(''), 4000)
    }
  }

  // ── Formulaire mot de passe ───────────────────────────────
  const [passwords, setPasswords] = useState({
    current: '', newPass: '', confirm: ''
  })
  const [showPass, setShowPass] = useState({ current: false, new: false, confirm: false })

  const savePassword = async () => {
    if (passwords.newPass !== passwords.confirm) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }
    if (passwords.newPass.length < 8) {
      setError('Le nouveau mot de passe doit faire au moins 8 caractères.')
      return
    }
    setLoading(true); setSuccess(''); setError('')
    try {
      await api.patch('/users/me/password', {
        currentPassword: passwords.current,
        newPassword: passwords.newPass,
      })
      setSuccess('Votre mot de passe a été modifié de façon sécurisée.')
      setPasswords({ current: '', newPass: '', confirm: '' })
    } catch (e: any) {
      setError(e?.message || 'Mot de passe actuel incorrect.')
    } finally {
      setLoading(false)
      setTimeout(() => setSuccess(''), 4000)
    }
  }

  const initials = `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase()

  return (
    <div className="space-y-6 max-w-4xl">

      {/* ── En-tête & Header Profil ───────────────────────── */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full pointer-events-none" />
        
        <div className="w-24 h-24 bg-gradient-to-br from-gray-900 to-gray-700 rounded-full flex items-center justify-center font-display text-3xl font-extrabold text-white shadow-lg shrink-0 border-4 border-white">
          {initials}
        </div>
        
        <div className="flex-1 text-center md:text-left pt-2">
          <h2 className="font-display text-2xl font-bold text-gray-900 mb-1">
            {user?.firstName} {user?.lastName}
          </h2>
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 text-sm text-gray-500 font-medium">
            <span className="flex items-center gap-1.5"><Mail size={14} className="text-gray-400" /> {user?.email}</span>
            <span className="hidden md:inline text-gray-300">•</span>
            <span className="flex items-center gap-1.5"><Phone size={14} className="text-gray-400" /> {user?.phone || 'Non renseigné'}</span>
          </div>
        </div>
      </div>

      {/* ── Navigation Tabs ───────────────────────────────── */}
      <div className="flex p-1 bg-gray-100/80 backdrop-blur-md rounded-xl w-full sm:w-fit">
        {[
          { value: 'info', label: 'Infos personnelles', icon: <User size={16} /> },
          { value: 'password', label: 'Mot de passe', icon: <Lock size={16} /> },
        ].map(({ value, label, icon }) => (
          <button key={value}
            onClick={() => { setTab(value as any); setSuccess(''); setError('') }}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all
              ${tab === value
                ? 'bg-white text-gray-900 shadow-sm border border-gray-200/50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}`}
          >
            {icon} <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* ── Feedback ──────────────────────────────────────── */}
      {success && <Alert tone="success">{success}</Alert>}
      {error && <Alert>{error}</Alert>}

      {/* ── Formulaire infos ──────────────────────────────── */}
      {tab === 'info' && (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 md:p-8 animate-in fade-in">
          <h3 className="font-bold text-gray-900 text-lg mb-6 pb-4 border-b border-gray-100">
            Détails du compte
          </h3>
          
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-2xs font-bold text-gray-500 uppercase tracking-wider mb-2">Prénom</label>
                <input type="text" placeholder="Ex: Salimata"
                  value={info.firstName} onChange={(e) => setInfo({ ...info, firstName: e.target.value })}
                  className={inputCls} />
              </div>
              <div>
                <label className="block text-2xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nom</label>
                <input type="text" placeholder="Ex: Kaboré"
                  value={info.lastName} onChange={(e) => setInfo({ ...info, lastName: e.target.value })}
                  className={inputCls} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-2xs font-bold text-gray-500 uppercase tracking-wider mb-2">Adresse Email</label>
                <input type="email" value={info.email} onChange={(e) => setInfo({ ...info, email: e.target.value })}
                  className={inputCls} />
              </div>
              <div>
                <label className="block text-2xs font-bold text-gray-500 uppercase tracking-wider mb-2">Téléphone</label>
                <input type="tel" placeholder="+226 70 00 00 00"
                  value={info.phone} onChange={(e) => setInfo({ ...info, phone: e.target.value })}
                  className={inputCls} />
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-gray-100">
              <button onClick={saveInfo} disabled={loading}
                className="bg-gray-900 text-white px-8 py-3.5 rounded-xl font-bold text-sm hover:bg-gray-800 transition-all disabled:opacity-60 flex items-center justify-center gap-2 w-full sm:w-auto shadow-sm">
                {loading ? (
                  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Enregistrement…</>
                ) : 'Enregistrer les modifications'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Formulaire mot de passe ───────────────────────── */}
      {tab === 'password' && (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 md:p-8 animate-in fade-in">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div className="w-10 h-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Sécurité du compte</h3>
              <p className="text-xs text-gray-600 mt-0.5">Mettez à jour votre mot de passe pour protéger vos données.</p>
            </div>
          </div>
          
          <div className="space-y-5 max-w-md">
            {[
              { key: 'current', label: 'Mot de passe actuel', show: showPass.current, toggle: () => setShowPass((p) => ({ ...p, current: !p.current })) },
              { key: 'newPass', label: 'Nouveau mot de passe', show: showPass.new, toggle: () => setShowPass((p) => ({ ...p, new: !p.new })) },
              { key: 'confirm', label: 'Confirmez le nouveau mot de passe', show: showPass.confirm, toggle: () => setShowPass((p) => ({ ...p, confirm: !p.confirm })) },
            ].map(({ key, label, show, toggle }) => (
              <div key={key}>
                <label className="block text-2xs font-bold text-gray-500 uppercase tracking-wider mb-2">{label}</label>
                <div className="relative">
                  <input
                    type={show ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={passwords[key as keyof typeof passwords]}
                    onChange={(e) => setPasswords({ ...passwords, [key]: e.target.value })}
                    className={`${inputCls} pr-12`}
                  />
                  <button onClick={toggle}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none bg-white p-1 rounded">
                    {show ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            ))}

            <div className="pt-6 mt-6 border-t border-gray-100">
              <button onClick={savePassword} disabled={loading}
                className="bg-gray-900 text-white px-8 py-3.5 rounded-xl font-bold text-sm hover:bg-gray-800 transition-all disabled:opacity-60 flex items-center justify-center gap-2 w-full sm:w-auto shadow-sm">
                {loading ? (
                  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Mise à jour…</>
                ) : 'Mettre à jour le mot de passe'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
