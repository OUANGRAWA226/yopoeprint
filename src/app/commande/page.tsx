'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/hooks/useAuth'
import { api } from '@/lib'
import { paymentService } from '@/lib/payment.service'
import {
  MapPin, CreditCard, CheckCircle,
  ChevronRight, ArrowRight, AlertCircle,
  Smartphone, ShieldCheck, Check, Package,
  Clock, Truck
} from 'lucide-react'
import PaymentGatewayModal from '@/components/checkout/PaymentGatewayModal'

function fmt(n: number) { return new Intl.NumberFormat('fr-FR').format(n) }

const STEPS = [
  { n: 1, label: 'Livraison',  icon: <MapPin size={14} /> },
  { n: 2, label: 'Récap',     icon: <CheckCircle size={14} /> },
  { n: 3, label: 'Paiement',  icon: <CreditCard size={14} /> },
]

const ZONES = [
  { id: 'ouaga_centre', label: 'Ouagadougou Centre',     price: 0,    delay: '24h',  icon: '🏙️' },
  { id: 'ouaga_periph', label: 'Ouagadougou Périphérie', price: 1500, delay: '48h',  icon: '🏘️' },
  { id: 'bobo',         label: 'Bobo-Dioulasso',         price: 3500, delay: '3-4j', icon: '🌆' },
  { id: 'koudougou',    label: 'Koudougou',              price: 3000, delay: '3-4j', icon: '🏡' },
  { id: 'ouahigouya',   label: 'Ouahigouya',             price: 3500, delay: '4-5j', icon: '🏡' },
  { id: 'other',        label: 'Autre ville',            price: 4500, delay: '5-7j', icon: '🗺️' },
  { id: 'pickup',       label: 'Retrait atelier (Ouaga)',price: 0,    delay: 'Sur RDV', icon: '📦' },
]

const PAYMENT_METHODS = [
  { id: 'orange_money', label: 'Orange Money', emoji: '🟠', color: 'bg-orange-50 border-orange-200', activeColor: 'border-orange-400 bg-orange-50', desc: 'Paiement via votre compte Orange', badge: 'Recommandé' },
  { id: 'moov_money',   label: 'Moov Money',   emoji: '🔵', color: 'bg-blue-50 border-blue-200',   activeColor: 'border-blue-400 bg-blue-50',   desc: 'Paiement via Moov / Telecel', badge: null },
  { id: 'card',         label: 'Carte bancaire', emoji: '💳', color: 'bg-gray-50 border-gray-200', activeColor: 'border-gray-400 bg-gray-50',   desc: 'Visa / Mastercard — CinetPay', badge: null },
  { id: 'bank_transfer',label: 'Virement',      emoji: '🏦', color: 'bg-gray-50 border-gray-200', activeColor: 'border-gray-400 bg-gray-50',   desc: 'B2B > 100 000 FCFA uniquement', badge: null },
]

// ─── Stepper ─────────────────────────────────────────────────
function Stepper({ current }: { current: number }) {
  return (
    <div className="flex items-center mb-8">
      {STEPS.map((s, i) => (
        <div key={s.n} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center gap-1">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all
              ${current > s.n  ? 'bg-primary text-white' :
                current === s.n ? 'bg-gray-900 text-white ring-4 ring-gray-900/10' :
                'bg-gray-100 text-gray-400'}`}>
              {current > s.n ? <Check size={15} strokeWidth={3} /> : s.n}
            </div>
            <span className={`text-[10px] font-bold whitespace-nowrap
              ${current >= s.n ? 'text-gray-900' : 'text-gray-400'}`}>
              {s.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`h-0.5 flex-1 mx-2 mb-4 rounded-full transition-all duration-500
              ${current > s.n ? 'bg-primary' : 'bg-gray-100'}`} />
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Input field helper ───────────────────────────────────────
function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[12px] font-bold text-gray-600 uppercase tracking-wide mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
    </div>
  )
}

const inputCls = "w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm outline-none focus:border-gray-400 focus:bg-white transition-all placeholder:text-gray-300"

// ─── Page ────────────────────────────────────────────────────
export default function CommandePage() {
  const router    = useRouter()
  const { items, total, clearCart } = useCart()
  const { user }  = useAuth()
  const [step, setStep]     = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [pendingPaymentId, setPendingPaymentId] = useState<string>('')
  const [pendingOrderId, setPendingOrderId] = useState<string>('')

  const [zone, setZone] = useState(ZONES[0])
  const [address, setAddress] = useState({
    fullName:     user?.firstName ? `${user.firstName} ${user.lastName}` : '',
    phone:        user?.phone || '',
    street:       '',
    neighborhood: '',
    instructions: '',
  })

  const [payMethod, setPayMethod] = useState('orange_money')
  const [mobileNum, setMobileNum] = useState('')

  const deliveryCost = total >= 75000 && zone.id !== 'other' ? 0 : zone.price
  const finalTotal   = total + deliveryCost

  useEffect(() => {
    if (items.length === 0) router.push('/panier')
    if (!user) router.push('/connexion?redirect=/commande')
  }, [items, user, router])

  const validateDelivery = () => {
    if (!address.fullName.trim()) { setError('Nom de livraison requis'); return false }
    if (!address.phone.trim())    { setError('Téléphone requis'); return false }
    if (zone.id !== 'pickup' && !address.street.trim()) {
      setError('Adresse requise'); return false
    }
    setError(''); return true
  }

  const handlePaymentSuccess = () => {
    setIsPaymentModalOpen(false)
    clearCart()
    if (pendingOrderId) {
      router.push(`/commande/confirmation?orderId=${pendingOrderId}`)
    }
  }

  const handlePayment = async () => {
    if ((payMethod === 'orange_money' || payMethod === 'moov_money') && (!mobileNum || mobileNum.length < 8)) {
      setError('Veuillez entrer un numéro de téléphone valide.')
      return
    }

    setLoading(true); setError('')
    try {
      // 1. Création de la commande
      const orderRes = await api.post('/orders', {
        items: items.map((i) => ({
          productId: i.productId, formatId: i.formatId, paperId: i.paperId,
          quantity: i.quantity, rectoverso: i.rectoverso, finition: i.finition, price: i.price,
          fileUrl: i.fileUrl, fileName: i.fileName,
        })),
        deliveryZone: zone.id,
        deliveryAddress: zone.id === 'pickup' ? null : address,
        deliveryCost, paymentMethod: payMethod, total: finalTotal,
      })
      
      const order = orderRes.data
      setPendingOrderId(order.id)

      // 2. Initiation du paiement
      const payRes = await paymentService.initiatePayment({
        orderId: order.id,
        amount: finalTotal,
        paymentMethod: payMethod,
        phoneNumber: payMethod !== 'card' ? mobileNum : undefined,
        returnUrl: `${window.location.origin}/commande/confirmation?orderId=${order.id}`,
        notifyUrl: `${process.env.NEXT_PUBLIC_API_URL}/payments/webhook`,
      })

      // 3. Redirection (Card ou CinetPay Hosted) OU Seamless (OTP)
      if (payRes.paymentUrl) {
        window.location.href = payRes.paymentUrl
      } else {
        // Mode Seamless : on ouvre la popup OTP
        setPendingPaymentId(payRes.paymentId || order.id)
        setIsPaymentModalOpen(true)
        setLoading(false)
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de l\'initialisation du paiement.')
      setLoading(false)
    }
  }

  if (!user || items.length === 0) return null

  return (
    <div className="min-h-screen bg-[#F8F8F8]">

      {/* ── Header ───────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-3">
            <Link href="/" className="hover:text-gray-700">Accueil</Link>
            <ChevronRight size={12} />
            <Link href="/panier" className="hover:text-gray-700">Panier</Link>
            <ChevronRight size={12} />
            <span className="text-gray-900 font-semibold">Commande</span>
          </div>
          <h1 className="font-display text-xl md:text-2xl font-extrabold text-gray-900">
            Finaliser ma commande
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-6 py-5 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5">

          {/* ── Formulaire ──────────────────────────────── */}
          <div>
            <Stepper current={step} />

            {error && (
              <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-sm text-red-600">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            {/* ══ ÉTAPE 1: LIVRAISON ══════════════════════ */}
            {step === 1 && (
              <div className="bg-white border border-gray-200 rounded-xl p-5 md:p-6 space-y-5">
                <h2 className="font-display text-lg font-extrabold text-gray-900">
                  📍 Adresse de livraison
                </h2>

                {/* Zone */}
                <div>
                  <label className="block text-[12px] font-bold text-gray-600 uppercase tracking-wide mb-2.5">
                    Zone de livraison *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {ZONES.map((z) => (
                      <button
                        key={z.id}
                        onClick={() => setZone(z)}
                        className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 text-left transition-all
                          ${zone.id === z.id
                            ? 'border-gray-900 bg-gray-50 shadow-sm'
                            : 'border-gray-200 bg-white hover:border-gray-300'}`}
                      >
                        <span className="text-xl shrink-0">{z.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className={`font-bold text-[13px] ${zone.id === z.id ? 'text-gray-900' : 'text-gray-700'}`}>
                            {z.label}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="flex items-center gap-1 text-[10px] text-gray-400">
                              <Clock size={9} /> {z.delay}
                            </span>
                          </div>
                        </div>
                        <span className={`text-sm font-bold shrink-0 ${z.price === 0 ? 'text-green-600' : 'text-gray-900'}`}>
                          {z.price === 0 ? 'Gratuit' : `${fmt(z.price)} FCFA`}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Champs adresse */}
                {zone.id !== 'pickup' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field label="Nom complet" required>
                        <input
                          type="text"
                          value={address.fullName}
                          onChange={(e) => setAddress((a) => ({ ...a, fullName: e.target.value }))}
                          placeholder="Salimata Kaboré"
                          className={inputCls}
                        />
                      </Field>
                      <Field label="Téléphone" required>
                        <input
                          type="tel"
                          value={address.phone}
                          onChange={(e) => setAddress((a) => ({ ...a, phone: e.target.value }))}
                          placeholder="+226 70 00 00 00"
                          className={inputCls}
                        />
                      </Field>
                    </div>
                    <Field label="Rue / Secteur" required>
                      <input
                        type="text"
                        value={address.street}
                        onChange={(e) => setAddress((a) => ({ ...a, street: e.target.value }))}
                        placeholder="Rue 12.45, Secteur 15"
                        className={inputCls}
                      />
                    </Field>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field label="Quartier">
                        <input
                          type="text"
                          value={address.neighborhood}
                          onChange={(e) => setAddress((a) => ({ ...a, neighborhood: e.target.value }))}
                          placeholder="Gounghin, Pissy…"
                          className={inputCls}
                        />
                      </Field>
                      <Field label="Instructions (optionnel)">
                        <input
                          type="text"
                          value={address.instructions}
                          onChange={(e) => setAddress((a) => ({ ...a, instructions: e.target.value }))}
                          placeholder="Face à la pharmacie…"
                          className={inputCls}
                        />
                      </Field>
                    </div>
                  </div>
                )}

                {zone.id === 'pickup' && (
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex gap-3">
                    <Package size={20} className="text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-gray-900 text-sm mb-0.5">Adresse de l&apos;atelier</p>
                      <p className="text-sm text-gray-600">Ouagadougou, Burkina Faso</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Vous serez contacté par SMS pour la date de retrait.
                      </p>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => { if (validateDelivery()) setStep(2) }}
                  className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-4 rounded-xl font-bold text-[15px] hover:bg-gray-800 active:scale-[0.99] transition-all"
                >
                  Continuer <ArrowRight size={16} />
                </button>
              </div>
            )}

            {/* ══ ÉTAPE 2: RÉCAPITULATIF ══════════════════ */}
            {step === 2 && (
              <div className="bg-white border border-gray-200 rounded-xl p-5 md:p-6 space-y-5">
                <h2 className="font-display text-lg font-extrabold text-gray-900">
                  ✅ Vérifiez votre commande
                </h2>

                {/* Articles */}
                <div className="divide-y divide-gray-50 -mx-1">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 py-3 px-1">
                      <div className="w-11 h-11 bg-gray-100 rounded-xl flex items-center justify-center text-2xl shrink-0">
                        {item.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 text-[13px] truncate">{item.productName}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          {item.formatLabel} · {fmt(item.quantity)} pièces
                          {item.rectoverso ? ' · R/V' : ''}
                        </p>
                      </div>
                      <p className="font-bold text-gray-900 text-[13px] shrink-0">{fmt(item.price)} FCFA</p>
                    </div>
                  ))}
                </div>

                {/* Adresse résumée */}
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Truck size={15} className="text-primary" />
                    <span className="font-bold text-gray-900 text-sm">Livraison</span>
                    <button
                      onClick={() => setStep(1)}
                      className="ml-auto text-xs text-primary underline underline-offset-4"
                    >
                      Modifier
                    </button>
                  </div>
                  <p className="text-sm text-gray-700 font-medium">{zone.label}</p>
                  {zone.id !== 'pickup' && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {address.fullName} · {address.phone}
                      {address.street && ` · ${address.street}`}
                      {address.neighborhood && `, ${address.neighborhood}`}
                    </p>
                  )}
                </div>

                {/* Totaux */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-500">
                    <span>Produits</span>
                    <span>{fmt(total)} FCFA</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Livraison</span>
                    <span className={deliveryCost === 0 ? 'text-green-600 font-semibold' : 'font-semibold text-gray-900'}>
                      {deliveryCost === 0 ? '🎁 Gratuite' : `${fmt(deliveryCost)} FCFA`}
                    </span>
                  </div>
                  <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                    <span className="font-extrabold text-gray-900">Total à payer</span>
                    <span className="font-display font-extrabold text-gray-900 text-2xl">
                      {fmt(finalTotal)} <span className="text-sm text-gray-400 font-normal">FCFA</span>
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setStep(1)}
                    className="flex items-center justify-center gap-2 py-3.5 border-2 border-gray-200 rounded-xl text-gray-700 font-bold text-sm hover:border-gray-300 transition-all"
                  >
                    ← Retour
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    className="flex items-center justify-center gap-2 py-3.5 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-all"
                  >
                    Paiement <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            )}

            {/* ══ ÉTAPE 3: PAIEMENT ══════════════════════ */}
            {step === 3 && (
              <div className="bg-white border border-gray-200 rounded-xl p-5 md:p-6 space-y-5">
                <h2 className="font-display text-lg font-extrabold text-gray-900">
                  💳 Mode de paiement
                </h2>

                {/* Méthodes */}
                <div className="space-y-2.5">
                  {PAYMENT_METHODS.map((m) => {
                    const sel = payMethod === m.id
                    return (
                      <button
                        key={m.id}
                        onClick={() => setPayMethod(m.id)}
                        className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all
                          ${sel ? m.activeColor + ' shadow-sm' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                      >
                        {/* Radio */}
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0
                          ${sel ? 'border-gray-900 bg-gray-900' : 'border-gray-300 bg-white'}`}>
                          {sel && <div className="w-2 h-2 bg-white rounded-full" />}
                        </div>
                        <span className="text-2xl shrink-0">{m.emoji}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[14px] text-gray-900">{m.label}</span>
                            {m.badge && (
                              <span className="text-[10px] font-bold bg-primary text-white px-2 py-0.5 rounded-full">
                                {m.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-gray-400 mt-0.5">{m.desc}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>

                {/* Numéro mobile */}
                {(payMethod === 'orange_money' || payMethod === 'moov_money') && (
                  <div>
                    <label className="block text-[12px] font-bold text-gray-600 uppercase tracking-wide mb-1.5">
                      Numéro {payMethod === 'orange_money' ? 'Orange' : 'Moov'} *
                    </label>
                    <div className="relative">
                      <Smartphone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="tel"
                        value={mobileNum}
                        onChange={(e) => setMobileNum(e.target.value)}
                        placeholder="+226 70 00 00 00"
                        className={`${inputCls} pl-11`}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1.5">
                      <ShieldCheck size={12} className="text-green-500" />
                      Vous recevrez une demande de confirmation sur ce numéro
                    </p>
                  </div>
                )}

                {/* Récap paiement */}
                <div className="bg-gray-900 rounded-xl p-4 text-center">
                  <p className="text-xs text-gray-400 mb-1">Montant total à payer</p>
                  <p className="font-display font-extrabold text-white text-3xl">
                    {fmt(finalTotal)} <span className="text-base font-normal text-gray-400">FCFA</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Livraison incluse</p>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <ShieldCheck size={14} className="text-green-500 shrink-0" />
                  Paiement sécurisé par CinetPay — données chiffrées SSL
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setStep(2)}
                    className="flex items-center justify-center gap-2 py-3.5 border-2 border-gray-200 rounded-xl text-gray-700 font-bold text-sm hover:border-gray-300 transition-all"
                  >
                    ← Retour
                  </button>
                  <button
                    onClick={handlePayment}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 py-3.5 bg-[#FF6B00] text-white rounded-xl font-bold text-[15px] hover:bg-[#E66000] active:scale-[0.98] transition-all shadow-md disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Traitement…
                      </>
                    ) : (
                      <>
                        <ShieldCheck size={16} />
                        Payer {fmt(finalTotal)} FCFA
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Sidebar récap sticky ──────────────────── */}
          <aside className="hidden lg:block">
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden sticky top-24">
              <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50">
                <h3 className="font-bold text-gray-900 text-[13px]">
                  Votre commande ({items.length} article{items.length > 1 ? 's' : ''})
                </h3>
              </div>
              <div className="p-5 space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex items-start gap-3">
                    <span className="text-xl shrink-0">{item.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-bold text-gray-900 truncate">{item.productName}</p>
                      <p className="text-[10px] text-gray-400">{fmt(item.quantity)} pièces</p>
                    </div>
                    <p className="text-[12px] font-bold text-gray-900 shrink-0">{fmt(item.price)} FCFA</p>
                  </div>
                ))}

                <div className="border-t border-gray-100 pt-3 space-y-2 text-[12px]">
                  <div className="flex justify-between text-gray-500">
                    <span>Livraison</span>
                    <span>{deliveryCost === 0 ? '🎁 Gratuite' : `${fmt(deliveryCost)} FCFA`}</span>
                  </div>
                  <div className="flex justify-between font-extrabold text-gray-900 text-[14px]">
                    <span>Total</span>
                    <span>{fmt(finalTotal)} FCFA</span>
                  </div>
                </div>

                <div className="pt-2 space-y-2">
                  {[
                    { icon: '🟠', label: 'Orange Money' },
                    { icon: '🔵', label: 'Moov Money' },
                    { icon: '💳', label: 'Carte bancaire' },
                  ].map(({ icon, label }) => (
                    <div key={label} className="flex items-center gap-2 text-[11px] text-gray-400">
                      <span>{icon}</span> {label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <PaymentGatewayModal 
        isOpen={isPaymentModalOpen}
        amount={finalTotal}
        paymentId={pendingPaymentId}
        onSuccess={handlePaymentSuccess}
        onCancel={() => setIsPaymentModalOpen(false)}
      />
    </div>
  )
}
