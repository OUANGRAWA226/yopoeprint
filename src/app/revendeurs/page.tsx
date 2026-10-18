'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Briefcase, BadgePercent, PackageOpen, Headphones, TrendingUp, Building, Phone, ArrowRight, CheckCircle2, Clock,
} from 'lucide-react'
import { useAuthContext } from '@/context/AuthContext'
import { resellerService, ResellerMe, ResellerApplication } from '@/lib/reseller.service'
import { Alert } from '@/components/ui/Alert'
import { usePublicSettings, PublicTier } from '@/lib/settings.service'

// Paliers par défaut, affichés le temps de lire ceux de la plateforme (admin › Paramètres)
const DEFAULT_TIERS: PublicTier[] = [
  { id: 'partenaire', label: 'Partenaire', rate: 15, minRevenue: 0 },
  { id: 'gold', label: 'Gold', rate: 18, minRevenue: 1_000_000 },
  { id: 'platinum', label: 'Platinum', rate: 20, minRevenue: 3_000_000 },
]

const tierCondition = (t: PublicTier) =>
  t.minRevenue > 0 ? `${new Intl.NumberFormat('fr-FR').format(t.minRevenue)} FCFA payés sur 12 mois` : 'Dès la validation'

function perks(tiers: PublicTier[]) {
  const first = tiers[0]?.rate ?? 0
  const best = tiers[tiers.length - 1]?.rate ?? first
  return [
    { icon: BadgePercent, title: `−${first} % sur tout le catalogue`, desc: 'La remise s\'applique automatiquement à chaque commande, dès la validation de votre compte.' },
    ...(best > first
      ? [{ icon: TrendingUp, title: `Jusqu'à −${best} % avec les paliers`, desc: 'Plus vous commandez, plus la remise augmente : calcul sur vos commandes payées des 12 derniers mois.' }]
      : []),
    { icon: PackageOpen, title: 'Livraison en marque blanche', desc: 'Colis neutre, bordereau à votre nom : vos clients ne voient jamais YopoePrint.' },
    { icon: Headphones, title: 'Suivi dédié', desc: 'Un interlocuteur pour vos devis complexes et la validation de vos fichiers.' },
  ]
}

const inputCls = 'w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary focus:bg-white transition-colors text-sm'

export default function RevendeursPage() {
  const { user, isLoggedIn, loading: authLoading } = useAuthContext()
  const [me, setMe] = useState<ResellerMe | null>(null)
  const [form, setForm] = useState<ResellerApplication>({ companyName: '', contactName: '', phone: '', volume: 'medium', message: '' })
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const loadedTiers = usePublicSettings().settings?.resellerTiers
  const TIERS = [...(loadedTiers?.length ? loadedTiers : DEFAULT_TIERS)].sort((a, b) => a.minRevenue - b.minRevenue)
  const PERKS = perks(TIERS)

  useEffect(() => {
    if (!isLoggedIn) { setMe(null); return }
    resellerService.getMe().then(setMe).catch(() => setMe(null))
  }, [isLoggedIn])

  useEffect(() => {
    if (user) {
      setForm((f) => ({
        ...f,
        contactName: f.contactName || `${user.firstName} ${user.lastName}`.trim(),
        phone: f.phone || user.phone || '',
      }))
    }
  }, [user])

  const set = (key: keyof ResellerApplication) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    setError('')
    try {
      setMe(await resellerService.apply({
        ...form,
        contactName: form.contactName?.trim() || undefined,
        message: form.message?.trim() || undefined,
      }))
    } catch (err: any) {
      setError(err?.message || 'Envoi impossible pour le moment')
    } finally {
      setSending(false)
    }
  }

  const renderAside = () => {
    if (authLoading) return <div className="h-64 rounded-xl bg-gray-100 animate-pulse" aria-busy="true" />

    if (!isLoggedIn) {
      return (
        <div className="space-y-4">
          <h2 className="font-display text-lg font-bold text-gray-900">Devenir revendeur</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            La demande se fait depuis un compte client : créez-le en une minute (ou connectez-vous), puis déposez votre candidature.
          </p>
          <Link href="/inscription?redirect=/revendeurs" className="btn-primary w-full">Créer mon compte</Link>
          <Link href="/connexion?redirect=/revendeurs" className="btn-outline w-full justify-center">J&apos;ai déjà un compte</Link>
        </div>
      )
    }

    if (me?.isReseller) {
      return (
        <div className="text-center space-y-4 py-4">
          <CheckCircle2 size={40} className="text-emerald-700 mx-auto" />
          <h2 className="font-display text-xl font-bold text-gray-900">Votre compte revendeur est actif</h2>
          <p className="text-sm text-gray-600">Palier {me.tier?.label} : −{me.tier?.rate} % sur toutes vos commandes.</p>
          <Link href="/revendeur" className="btn-primary w-full">Ouvrir mon espace revendeur</Link>
        </div>
      )
    }

    if (me?.status === 'pending') {
      return (
        <div className="text-center space-y-4 py-4">
          <Clock size={40} className="text-gray-700 mx-auto" />
          <h2 className="font-display text-xl font-bold text-gray-900">Demande reçue</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Nous examinons la demande de <strong>{me.companyName}</strong> et vous répondons par email sous 24 h ouvrées.
          </p>
        </div>
      )
    }

    if (me?.status === 'rejected' || me?.status === 'suspended') {
      return (
        <div className="space-y-4">
          <h2 className="font-display text-lg font-bold text-gray-900">
            {me.status === 'rejected' ? 'Demande non retenue' : 'Compte revendeur suspendu'}
          </h2>
          <p className="text-sm text-gray-600">Contactez-nous pour en discuter.</p>
          <Link href="/contact" className="btn-primary w-full">Nous contacter</Link>
        </div>
      )
    }

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <h2 className="font-display text-lg font-bold text-gray-900">Devenir revendeur</h2>
        <p className="text-xs text-gray-600">Réponse sous 24 h ouvrées. La remise s&apos;applique dès la validation.</p>
        {error && <Alert>{error}</Alert>}

        <div className="space-y-1">
          <label htmlFor="r-company" className="text-xs font-bold text-gray-700">Société / agence *</label>
          <div className="relative">
            <Building className="absolute left-3.5 top-3 text-gray-400" size={16} aria-hidden="true" />
            <input id="r-company" required minLength={2} placeholder="Nom de l'entreprise" value={form.companyName}
              onChange={set('companyName')} className={`${inputCls} pl-10`} />
          </div>
        </div>
        <div className="space-y-1">
          <label htmlFor="r-contact" className="text-xs font-bold text-gray-700">Nom du contact</label>
          <input id="r-contact" value={form.contactName} onChange={set('contactName')} className={inputCls} />
        </div>
        <div className="space-y-1">
          <label htmlFor="r-phone" className="text-xs font-bold text-gray-700">Téléphone *</label>
          <div className="relative">
            <Phone className="absolute left-3.5 top-3 text-gray-400" size={16} aria-hidden="true" />
            <input id="r-phone" type="tel" required placeholder="+226 70 00 00 00" value={form.phone}
              onChange={set('phone')} className={`${inputCls} pl-10`} />
          </div>
        </div>
        <div className="space-y-1">
          <label htmlFor="r-volume" className="text-xs font-bold text-gray-700">Volume mensuel estimé</label>
          <select id="r-volume" value={form.volume} onChange={set('volume')} className={inputCls}>
            <option value="low">Moins de 100 000 FCFA / mois</option>
            <option value="medium">100 000 à 500 000 FCFA / mois</option>
            <option value="high">Plus de 500 000 FCFA / mois</option>
          </select>
        </div>
        <div className="space-y-1">
          <label htmlFor="r-message" className="text-xs font-bold text-gray-700">Vos besoins</label>
          <textarea id="r-message" rows={3} placeholder="Supports que vous faites imprimer le plus souvent…"
            value={form.message} onChange={set('message')} className={`${inputCls} resize-none`} />
        </div>
        <button type="submit" disabled={sending} className="btn-primary w-full disabled:opacity-60">
          {sending ? 'Envoi…' : <>Déposer ma candidature <ArrowRight size={14} /></>}
        </button>
      </form>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gray-900 text-white py-16 text-center">
        <div className="max-w-3xl mx-auto px-6">
          <span className="inline-flex items-center gap-2 bg-white/10 border border-white/15 text-emerald-300 text-xs font-bold px-3.5 py-1.5 rounded-full mb-4 uppercase tracking-widest">
            <Briefcase size={12} /> Agences, graphistes, imprimeurs
          </span>
          <h1 className="font-display text-4xl lg:text-5xl font-extrabold mb-4 leading-tight">Programme revendeurs</h1>
          <p className="text-gray-300 text-base lg:text-lg leading-relaxed max-w-2xl mx-auto">
            Externalisez votre production chez YopoePrint : remise automatique sur tout le catalogue et livraison en marque blanche chez vos clients.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-10">
          <div className="space-y-10">
            <div className="grid sm:grid-cols-2 gap-5">
              {PERKS.map((p) => (
                <div key={p.title} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-3">
                  <div className="w-11 h-11 bg-emerald-50 text-emerald-700 rounded-xl flex items-center justify-center">
                    <p.icon size={20} aria-hidden="true" />
                  </div>
                  <h2 className="font-bold text-gray-900 text-base">{p.title}</h2>
                  <p className="text-gray-600 text-sm leading-relaxed">{p.desc}</p>
                </div>
              ))}
            </div>

            <div>
              <h2 className="font-display text-xl font-bold text-gray-900 mb-4">Les paliers</h2>
              <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-left text-xs font-bold text-gray-600 uppercase tracking-wide">
                      <th className="px-5 py-3">Palier</th><th className="px-5 py-3">Remise</th><th className="px-5 py-3">Condition</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {TIERS.map((t) => (
                      <tr key={t.id}>
                        <td className="px-5 py-3 font-bold text-gray-900">{t.label}</td>
                        <td className="px-5 py-3 font-bold text-emerald-700 tabular-nums">−{t.rate} %</td>
                        <td className="px-5 py-3 text-gray-600">{tierCondition(t)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-gray-600 mt-2">La remise revendeur ne se cumule pas avec un code promo : la plus avantageuse s&apos;applique.</p>
            </div>
          </div>

          <aside className="bg-white border border-gray-100 rounded-2xl p-6 shadow-md h-fit">{renderAside()}</aside>
        </div>
      </div>
    </div>
  )
}
