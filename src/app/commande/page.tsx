'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import { useAuthContext } from '@/context/AuthContext'
import { api } from '@/lib'
import { paymentsService } from '@/lib/payments.service'
import { resellerService, ResellerMe } from '@/lib/reseller.service'
import {
  MapPin, CreditCard, CheckCircle,
  ChevronRight, ArrowRight, AlertCircle,
  Smartphone, ShieldCheck, Check, Package,
  Clock, Truck, Tag, X, Loader2, UserCheck, LogIn, Eye, EyeOff
} from 'lucide-react'
import { BatPreviewModal } from '@/components/product/BatPreviewModal'
import { useToast } from '@/context/ToastContext'

function fmt(n: number) { return new Intl.NumberFormat('fr-FR').format(n) }

const STEPS = [
  { n: 1, label: 'Livraison',  icon: <MapPin size={14} /> },
  { n: 2, label: 'Récapitulatif', icon: <CheckCircle size={14} /> },
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
  { id: 'orange_money', label: 'Orange Money', emoji: '🟠', color: 'bg-orange-50 border-orange-200', activeColor: 'border-orange-500 bg-orange-50', desc: 'Paiement instantané Orange Burkina (#144#)', badge: 'Le plus rapide' },
  { id: 'moov_money',   label: 'Moov Money',   emoji: '🔵', color: 'bg-blue-50 border-blue-200',   activeColor: 'border-blue-500 bg-blue-50',   desc: 'Paiement Moov / Telecel Burkina (*555#)', badge: null },
  { id: 'card',         label: 'Carte bancaire', emoji: '💳', color: 'bg-gray-50 border-gray-200', activeColor: 'border-gray-900 bg-gray-50',   desc: 'Visa / Mastercard — Sécurisé CinetPay', badge: null },
  { id: 'bank_transfer',label: 'Virement / Chèque', emoji: '🏦', color: 'bg-gray-50 border-gray-200', activeColor: 'border-gray-900 bg-gray-50',   desc: 'Entreprises B2B (> 100 000 FCFA)', badge: 'B2B' },
]

// Storefront payment choice → PaymentMethod enum of the API
const API_PAYMENT_METHOD: Record<string, string> = {
  orange_money:  'orange_money',
  moov_money:    'moov_money',
  card:          'visa',
  bank_transfer: 'virement',
}

type CreatedOrder = { id: string; orderNumber: string; total: number }

// ─── Stepper ─────────────────────────────────────────────────
function Stepper({ current, onStepClick }: { current: number; onStepClick: (step: number) => void }) {
  return (
    <div className="flex items-center mb-8">
      {STEPS.map((s, i) => {
        const isClickable = s.n < current
        return (
          <div key={s.n} className="flex items-center flex-1 last:flex-none">
            <button
              type="button"
              disabled={!isClickable}
              onClick={() => isClickable && onStepClick(s.n)}
              className={`flex flex-col items-center gap-1.5 transition-all text-left ${
                isClickable ? 'cursor-pointer group' : 'cursor-default'
              }`}
            >
              <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all
                ${current > s.n  ? 'bg-primary text-white shadow-xs group-hover:scale-105' :
                  current === s.n ? 'bg-gray-900 text-white ring-4 ring-gray-900/10' :
                  'bg-gray-100 text-gray-400'}`}>
                {current > s.n ? <Check size={15} strokeWidth={3} /> : s.n}
              </div>
              <span className={`text-2xs font-bold whitespace-nowrap transition-colors
                ${current >= s.n ? 'text-gray-900' : 'text-gray-400'}
                ${isClickable ? 'group-hover:text-primary' : ''}`}>
                {s.label}
              </span>
            </button>
            {i < STEPS.length - 1 && (
              <div className={`h-0.5 flex-1 mx-3 mb-5 rounded-full transition-all duration-500
                ${current > s.n ? 'bg-primary' : 'bg-gray-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Input field helper ───────────────────────────────────────
function Field({ label, required, children, helper }: { label: string; required?: boolean; children: React.ReactNode; helper?: string }) {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {helper && <p className="text-2xs text-gray-600 mt-1">{helper}</p>}
    </div>
  )
}

const inputCls = "w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm outline-none focus:border-primary focus:bg-white transition-all placeholder:text-gray-400 font-medium"

// ─── Page ────────────────────────────────────────────────────
export default function CommandePage() {
  const router = useRouter()
  const toast = useToast()
  const { items, total, hydrated, appliedPromo, discount, applyPromo, removePromo } = useCart()
  const { user, login } = useAuthContext()

  // Revendeur : remise de palier (la plus avantageuse entre elle et le code promo, comme l'API)
  const [reseller, setReseller] = useState<ResellerMe | null>(null)
  const [whiteLabel, setWhiteLabel] = useState(false)
  useEffect(() => {
    if (user?.role !== 'reseller') { setReseller(null); return }
    resellerService.getMe().then(setReseller).catch(() => setReseller(null))
  }, [user?.role])

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  // Order already created server-side, reused if the customer retries the payment
  const [pendingOrder, setPendingOrder] = useState<CreatedOrder | null>(null)

  // Modal BAT preview
  const [previewBatUrl, setPreviewBatUrl] = useState<string | null>(null)

  // Code promo inline state
  const [promoInput, setPromoInput] = useState('')
  const [promoLoading, setPromoLoading] = useState(false)
  const [promoErr, setPromoErr] = useState('')

  // Inline login toggle state
  const [showInlineLogin, setShowInlineLogin] = useState(false)
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [showPass, setShowPass] = useState(false)

  const [zone, setZone] = useState(ZONES[0])
  const [address, setAddress] = useState({
    fullName: '',
    phone: '',
    email: '',
    street: '',
    neighborhood: '',
    instructions: '',
  })

  const [payMethod, setPayMethod] = useState('orange_money')

  // Remplir automatiquement avec les infos utilisateur dès qu'il est disponible
  useEffect(() => {
    if (user) {
      setAddress((prev) => ({
        ...prev,
        fullName: prev.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        phone: prev.phone || user.phone || '',
        email: prev.email || user.email || '',
      }))
    }
  }, [user])

  // Any change to the cart or delivery invalidates the order created earlier
  useEffect(() => {
    setPendingOrder(null)
  }, [items, zone, appliedPromo, address, payMethod])

  // Redirection si panier vide (une fois le panier enregistré relu)
  useEffect(() => {
    if (hydrated && items.length === 0) {
      router.push('/panier')
    }
  }, [hydrated, items, router])

  const deliveryCost = total >= 75000 && zone.id !== 'other' ? 0 : zone.price
  const resellerRate = reseller?.isReseller ? reseller.tier?.rate || 0 : 0
  const resellerDiscount = Math.round((total * resellerRate) / 100)
  const useResellerDiscount = resellerDiscount > discount
  const effectiveDiscount = Math.max(discount, resellerDiscount)
  const discountLabel = useResellerDiscount
    ? `Remise revendeur ${reseller?.tier?.label} (−${resellerRate} %)`
    : `Remise code promo (${appliedPromo?.code})`
  const finalTotal = Math.max(0, total - effectiveDiscount + deliveryCost)
  // The API re-prices every order: once created, its total is the amount due
  const amountDue = pendingOrder?.total ?? finalTotal

  const handleApplyPromoCode = async () => {
    const code = promoInput.trim().toUpperCase()
    if (!code) return
    setPromoLoading(true)
    setPromoErr('')
    try {
      const res = await applyPromo(code)
      if (res.success) {
        setPromoInput('')
        toast.success(`Code « ${code} » appliqué !`, res.message)
      } else {
        setPromoErr(res.message)
      }
    } catch {
      setPromoErr('Erreur lors de la validation du code')
    } finally {
      setPromoLoading(false)
    }
  }

  const handleInlineLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!loginEmail || !loginPassword) {
      setLoginError('Veuillez renseigner votre email et mot de passe')
      return
    }
    setLoginLoading(true)
    setLoginError('')
    try {
      await login(loginEmail, loginPassword)
      toast.success('Connexion réussie', 'Vos coordonnées ont été chargées.')
      setShowInlineLogin(false)
    } catch (err: any) {
      setLoginError(err.response?.data?.message || 'Email ou mot de passe incorrect')
    } finally {
      setLoginLoading(false)
    }
  }

  const validateDelivery = () => {
    if (!address.fullName.trim()) { setError('Nom complet du destinataire requis'); return false }
    if (!address.phone.trim() || address.phone.replace(/\D/g, '').length < 8) {
      setError('Numéro de téléphone valide (8 chiffres min) requis pour la livraison'); return false
    }
    if (!user && address.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address.email)) {
      setError('Adresse email invalide pour la confirmation'); return false
    }
    if (zone.id !== 'pickup' && !address.street.trim()) {
      setError('Adresse de livraison (rue ou secteur) requise'); return false
    }
    setError(''); return true
  }

  const handlePayment = async () => {
    if (!user) {
      setError('Connectez-vous ou créez un compte pour finaliser et suivre votre commande.')
      setShowInlineLogin(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    setLoading(true); setError('')
    try {
      let order = pendingOrder
      if (!order) {
        order = await api.post<CreatedOrder>('/orders', {
          items: items.map((i) => ({
            productId:     i.productId,
            formatId:      i.formatId,
            paperId:       i.paperId,
            finishId:      i.finishId,
            quantity:      i.quantity,
            rectoverso:    i.rectoverso,
            designFileUrl: i.fileUrl,
          })),
          deliveryZone: zone.id,
          deliveryAddress: {
            fullName:     address.fullName,
            phone:        address.phone,
            street:       address.street || undefined,
            neighborhood: address.neighborhood || undefined,
          },
          paymentMethod: API_PAYMENT_METHOD[payMethod],
          promoCode:     appliedPromo?.code || undefined,
          customerNotes: address.instructions || undefined,
          whiteLabel:    reseller?.isReseller && whiteLabel ? true : undefined,
        })
        setPendingOrder(order)

        if (order.total !== finalTotal) {
          setError(`Le montant a été recalculé par notre atelier : ${fmt(order.total)} FCFA. Vérifiez-le puis cliquez à nouveau sur « Payer ».`)
          setLoading(false)
          return
        }
      }

      if (payMethod === 'bank_transfer') {
        router.push(`/commande/confirmation?orderId=${order.id}&method=virement`)
        return
      }

      // CinetPay hosted page: the customer confirms there with Orange / Moov / card.
      // The cart is cleared on the confirmation page, so a cancelled payment keeps it.
      const { paymentUrl } = await paymentsService.initPayment(order.id)
      paymentsService.redirectToPayment(paymentUrl)
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'initialisation de la commande. Veuillez vérifier vos données.")
      setLoading(false)
    }
  }

  if (items.length === 0) return null

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Header ───────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-2">
            <Link href="/" className="hover:text-gray-700 transition-colors">Accueil</Link>
            <ChevronRight size={12} />
            <Link href="/panier" className="hover:text-gray-700 transition-colors">Panier</Link>
            <ChevronRight size={12} />
            <span className="text-gray-900 font-semibold">Finalisation de commande</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h1 className="font-display text-xl md:text-2xl font-extrabold text-gray-900">
              Finaliser ma commande
            </h1>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <ShieldCheck size={16} className="text-primary" />
              <span>Paiement sécurisé · Facture conforme DGI</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-6 py-5 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">

          {/* ── Formulaire & Étapes ───────────────────────── */}
          <div>
            <Stepper current={step} onStepClick={(s) => setStep(s)} />

            {/* Notification de compte / Commande invité */}
            {!user ? (
              <div className="mb-6 bg-white border border-gray-200 rounded-2xl p-4 shadow-xs">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                      ⚡
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-xs">Un compte est nécessaire pour payer</p>
                      <p className="text-2xs text-gray-500">
                        Il vous permet de suivre la commande et de valider votre BAT.{' '}
                        <Link href="/inscription?redirect=/commande" className="font-bold text-primary hover:underline">Créer un compte</Link>
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowInlineLogin(!showInlineLogin)}
                    className="text-xs font-bold text-primary hover:underline flex items-center gap-1 shrink-0"
                  >
                    <LogIn size={13} />
                    {showInlineLogin ? 'Fermer' : 'Déjà un compte ?'}
                  </button>
                </div>

                {/* Formulaire de connexion inline sans quitter la page */}
                {showInlineLogin && (
                  <form onSubmit={handleInlineLogin} className="mt-4 pt-4 border-t border-gray-100 space-y-3 animate-in fade-in">
                    <p className="text-xs text-gray-600 font-medium">Connectez-vous pour finaliser la commande :</p>
                    {loginError && <p className="text-xs text-red-500 font-bold">{loginError}</p>}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="email"
                        placeholder="Votre email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-primary"
                      />
                      <div className="relative">
                        <input
                          type={showPass ? 'text' : 'password'}
                          placeholder="Mot de passe"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-primary pr-8"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPass(!showPass)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                        >
                          {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={loginLoading}
                      className="px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2"
                    >
                      {loginLoading ? <Loader2 size={12} className="animate-spin" /> : 'Se connecter'}
                    </button>
                  </form>
                )}
              </div>
            ) : (
              <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3 flex items-center justify-between text-xs text-emerald-900">
                <div className="flex items-center gap-2">
                  <UserCheck size={16} className="text-emerald-600 shrink-0" />
                  <span>Connecté en tant que <strong>{user.firstName} {user.lastName}</strong> ({user.email})</span>
                </div>
                <span className="text-2xs bg-emerald-200 text-emerald-900 font-bold px-2 py-0.5 rounded-full">Compte vérifié</span>
              </div>
            )}

            {error && (
              <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-sm text-red-600">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* ══ ÉTAPE 1: LIVRAISON ══════════════════════ */}
            {step === 1 && (
              <div className="bg-white border border-gray-200 rounded-2xl p-5 md:p-6 space-y-6 shadow-xs">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-lg font-extrabold text-gray-900 flex items-center gap-2">
                    <MapPin size={20} className="text-primary" />
                    Adresse & Zone de livraison
                  </h2>
                  <span className="text-xs text-gray-400">Étape 1 sur 3</span>
                </div>

                {/* Zone */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2.5">
                    Sélectionnez votre zone de réception *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {ZONES.map((z) => (
                      <button
                        type="button"
                        key={z.id}
                        onClick={() => setZone(z)}
                        className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 text-left transition-all
                          ${zone.id === z.id
                            ? 'border-gray-900 bg-gray-50/80 shadow-xs'
                            : 'border-gray-200 bg-white hover:border-gray-300'}`}
                      >
                        <span className="text-xl shrink-0">{z.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className={`font-bold text-sm ${zone.id === z.id ? 'text-gray-900' : 'text-gray-700'}`}>
                            {z.label}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="flex items-center gap-1 text-2xs text-gray-400">
                              <Clock size={10} /> Délai: {z.delay}
                            </span>
                          </div>
                        </div>
                        <span className={`text-xs font-bold shrink-0 ${z.price === 0 ? 'text-green-600 font-extrabold' : 'text-gray-900'}`}>
                          {z.price === 0 ? 'Gratuit' : `${fmt(z.price)} F`}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Champs adresse */}
                {zone.id !== 'pickup' ? (
                  <div className="space-y-4 pt-2 border-t border-gray-100">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field label="Nom complet / Société" required>
                        <input
                          type="text"
                          value={address.fullName}
                          onChange={(e) => setAddress((a) => ({ ...a, fullName: e.target.value }))}
                          placeholder="Ex: Salimata Kaboré ou Entreprise SARL"
                          className={inputCls}
                        />
                      </Field>
                      <Field label="Téléphone de contact" required helper="Numéro utilisé pour la livraison à Ouaga">
                        <input
                          type="tel"
                          value={address.phone}
                          onChange={(e) => setAddress((a) => ({ ...a, phone: e.target.value }))}
                          placeholder="+226 70 00 00 00"
                          className={inputCls}
                        />
                      </Field>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field label="Email pour le reçu et la facture" required={!user} helper="Pour recevoir le récapitulatif officiel">
                        <input
                          type="email"
                          value={address.email}
                          onChange={(e) => setAddress((a) => ({ ...a, email: e.target.value }))}
                          placeholder="contact@exemple.bf"
                          className={inputCls}
                        />
                      </Field>
                      <Field label="Quartier / Secteur" required>
                        <input
                          type="text"
                          value={address.neighborhood}
                          onChange={(e) => setAddress((a) => ({ ...a, neighborhood: e.target.value }))}
                          placeholder="Gounghin, Ouaga 2000, Pissy, Zone 1…"
                          className={inputCls}
                        />
                      </Field>
                    </div>

                    <Field label="Rue / Précision adresse" required>
                      <input
                        type="text"
                        value={address.street}
                        onChange={(e) => setAddress((a) => ({ ...a, street: e.target.value }))}
                        placeholder="Rue 15.24, face pharmacie ou repère connu"
                        className={inputCls}
                      />
                    </Field>

                    <Field label="Instructions particulières de livraison (optionnel)">
                      <input
                        type="text"
                        value={address.instructions}
                        onChange={(e) => setAddress((a) => ({ ...a, instructions: e.target.value }))}
                        placeholder="Ex: Livrer entre 14h et 17h, appeler à l'arrivée"
                        className={inputCls}
                      />
                    </Field>
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex gap-3.5">
                    <Package size={22} className="text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-gray-900 text-sm mb-0.5">Retrait direct à l'atelier YopoePrint</p>
                      <p className="text-sm text-gray-600">Ouagadougou, Burkina Faso</p>
                      <p className="text-xs text-gray-600 mt-1">
                        Vous recevrez une notification par SMS et WhatsApp dès que vos impressions seront prêtes.
                      </p>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => { if (validateDelivery()) setStep(2) }}
                  className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-4 rounded-xl font-bold text-base hover:bg-gray-800 active:scale-[0.99] transition-all shadow-md"
                >
                  Continuer vers le récapitulatif <ArrowRight size={16} />
                </button>
              </div>
            )}

            {/* ══ ÉTAPE 2: RÉCAPITULATIF ══════════════════ */}
            {step === 2 && (
              <div className="bg-white border border-gray-200 rounded-2xl p-5 md:p-6 space-y-6 shadow-xs">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-lg font-extrabold text-gray-900 flex items-center gap-2">
                    <CheckCircle size={20} className="text-primary" />
                    Vérifiez votre commande
                  </h2>
                  <span className="text-xs text-gray-400">Étape 2 sur 3</span>
                </div>

                {/* Articles */}
                <div className="divide-y divide-gray-100 -mx-1">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-start gap-3 py-3 px-1">
                      <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-2xl shrink-0">
                        {item.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 text-sm">{item.productName}</p>
                        <p className="text-2xs text-gray-500 mt-0.5">
                          {item.formatLabel} · {item.paperLabel} · {fmt(item.quantity)} pièces
                          {item.rectoverso ? ' · Recto/Verso' : ' · Recto'}
                          {item.finition && item.finition !== 'none' && item.finition !== 'Sans finition' ? ` · ${item.finition}` : ''}
                        </p>
                        {item.fileUrl ? (
                          <div className="mt-1 flex items-center gap-2">
                            <span className="text-2xs bg-green-100 text-green-800 font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                              ✓ Fichier joint
                            </span>
                            <button
                              type="button"
                              onClick={() => setPreviewBatUrl(item.fileUrl || null)}
                              className="text-2xs text-indigo-600 hover:underline font-bold"
                            >
                              Voir le BAT
                            </button>
                          </div>
                        ) : (
                          <p className="text-2xs text-amber-700 mt-1 flex items-center gap-1">
                            <span>💬</span> Visuel à transmettre ultérieurement (WhatsApp / Email)
                          </p>
                        )}
                      </div>
                      <p className="font-display font-bold text-gray-900 text-sm shrink-0">{fmt(item.price)} FCFA</p>
                    </div>
                  ))}
                </div>

                {/* Adresse résumée */}
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Truck size={16} className="text-primary" />
                    <span className="font-bold text-gray-900 text-sm">Mode de réception</span>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="ml-auto text-xs text-primary font-bold hover:underline"
                    >
                      Modifier
                    </button>
                  </div>
                  <p className="text-sm text-gray-800 font-semibold">{zone.label} ({zone.delay})</p>
                  {zone.id !== 'pickup' && (
                    <p className="text-xs text-gray-500 mt-1">
                      Destinataire : {address.fullName} · {address.phone}
                      {address.street && ` · ${address.street}`}
                      {address.neighborhood && `, ${address.neighborhood}`}
                    </p>
                  )}
                </div>

                {/* Marque blanche (revendeurs) */}
                {reseller?.isReseller && (
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                    {reseller.whiteLabel ? (
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={whiteLabel}
                          onChange={(e) => { setWhiteLabel(e.target.checked); setPendingOrder(null) }}
                          className="mt-0.5 w-4 h-4 accent-primary"
                        />
                        <span>
                          <span className="block text-sm font-bold text-gray-900">Expédier en marque blanche</span>
                          <span className="block text-xs text-gray-600 mt-0.5">
                            Colis neutre, bordereau au nom de {reseller.whiteLabel.companyName}, sans mention de YopoePrint.
                          </span>
                        </span>
                      </label>
                    ) : (
                      <p className="text-xs text-gray-600">
                        Livraison en marque blanche disponible :{' '}
                        <Link href="/revendeur/marque-blanche" className="font-bold text-primary hover:underline">
                          configurez votre identité d&apos;expéditeur
                        </Link>.
                      </p>
                    )}
                  </div>
                )}

                {/* Totaux & Remise */}
                <div className="space-y-2.5 text-sm pt-2 border-t border-gray-100">
                  <div className="flex justify-between text-gray-600">
                    <span>Sous-total produits</span>
                    <span>{fmt(total)} FCFA</span>
                  </div>
                  {effectiveDiscount > 0 && (
                    <div className="flex justify-between text-green-600 font-bold">
                      <span>{discountLabel}</span>
                      <span>−{fmt(effectiveDiscount)} FCFA</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Frais de livraison</span>
                    <span className={deliveryCost === 0 ? 'text-green-600 font-bold' : 'font-semibold text-gray-900'}>
                      {deliveryCost === 0 ? '🎁 Gratuite' : `${fmt(deliveryCost)} FCFA`}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
                    <span className="font-extrabold text-gray-900 text-base">Net à payer</span>
                    <span className="font-display font-extrabold text-gray-900 text-2xl">
                      {fmt(finalTotal)} <span className="text-sm text-gray-400 font-normal">FCFA</span>
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex items-center justify-center gap-2 py-3.5 border-2 border-gray-200 rounded-xl text-gray-700 font-bold text-sm hover:border-gray-300 transition-all"
                  >
                    ← Modifier livraison
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="flex items-center justify-center gap-2 py-3.5 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-all shadow-md"
                  >
                    Passer au paiement <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            )}

            {/* ══ ÉTAPE 3: PAIEMENT ══════════════════════ */}
            {step === 3 && (
              <div className="bg-white border border-gray-200 rounded-2xl p-5 md:p-6 space-y-6 shadow-xs">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-lg font-extrabold text-gray-900 flex items-center gap-2">
                    <CreditCard size={20} className="text-primary" />
                    Choisissez votre mode de règlement
                  </h2>
                  <span className="text-xs text-gray-400">Étape 3 sur 3</span>
                </div>

                {/* Méthodes */}
                <div className="space-y-3">
                  {PAYMENT_METHODS.map((m) => {
                    const sel = payMethod === m.id
                    return (
                      <button
                        type="button"
                        key={m.id}
                        onClick={() => setPayMethod(m.id)}
                        className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all
                          ${sel ? m.activeColor + ' shadow-xs' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                      >
                        {/* Radio */}
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0
                          ${sel ? 'border-gray-900 bg-gray-900' : 'border-gray-300 bg-white'}`}>
                          {sel && <div className="w-2 h-2 bg-white rounded-full" />}
                        </div>
                        <span className="text-2xl shrink-0">{m.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-gray-900">{m.label}</span>
                            {m.badge && (
                              <span className="text-2xs font-bold bg-primary text-white px-2 py-0.5 rounded-full">
                                {m.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">{m.desc}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>

                {payMethod !== 'bank_transfer' && (
                  <p className="text-xs text-gray-500 flex items-start gap-1.5 bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <ShieldCheck size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                    Vous serez redirigé vers la page de paiement sécurisée CinetPay pour valider le règlement
                    {payMethod === 'card' ? ' par carte.' : ' avec votre code ' + (payMethod === 'orange_money' ? 'Orange Money.' : 'Moov Money.')}
                  </p>
                )}

                {payMethod === 'bank_transfer' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-900 space-y-1">
                    <p className="font-bold">Instructions Virement bancaire / Bon de commande :</p>
                    <p>Votre commande sera enregistrée sous le statut « En attente de virement ». Nos coordonnées bancaires (Coris Bank / BOA) et la facture proforma vous seront transmises immédiatement.</p>
                  </div>
                )}

                {/* Récap paiement */}
                <div className="bg-gray-900 rounded-2xl p-5 text-center shadow-lg">
                  <p className="text-xs text-gray-400 mb-1 uppercase tracking-wider font-semibold">Montant total net à régler</p>
                  <p className="font-display font-extrabold text-white text-3xl md:text-4xl">
                    {fmt(amountDue)} <span className="text-base font-normal text-gray-400">FCFA</span>
                  </p>
                  <p className="text-xs text-gray-600 mt-1">TVA & frais de livraison inclus</p>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-500 justify-center">
                  <ShieldCheck size={16} className="text-green-600 shrink-0" />
                  <span>Paiement chiffré SSL 256-bit certifié · Reçu et facture DGI instantanés</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="flex items-center justify-center gap-2 py-3.5 border-2 border-gray-200 rounded-xl text-gray-700 font-bold text-sm hover:border-gray-300 transition-all"
                  >
                    ← Retour récap
                  </button>
                  <button
                    type="button"
                    onClick={handlePayment}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 py-3.5 bg-primary text-white rounded-xl font-bold text-base hover:bg-primary/90 active:scale-[0.98] transition-all shadow-md disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Traitement…
                      </>
                    ) : (
                      <>
                        <ShieldCheck size={18} />
                        Payer {fmt(amountDue)} FCFA
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Sidebar récapitulatif & Code Promo ──────────────── */}
          <aside className="space-y-4">
            
            {/* Boîte code promo */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs">
              <div className="flex items-center gap-2 mb-3">
                <Tag size={15} className="text-primary" />
                <h3 className="font-bold text-gray-900 text-xs uppercase tracking-wide">Code promo</h3>
              </div>
              {appliedPromo ? (
                <div className="flex items-center justify-between p-2.5 bg-green-50 border border-green-200 rounded-xl">
                  <div>
                    <span className="text-green-800 font-bold text-xs flex items-center gap-1">
                      <Check size={12} strokeWidth={3} /> {appliedPromo.code}
                    </span>
                    <span className="text-2xs text-green-600 block">
                      −{fmt(discount)} FCFA
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removePromo()}
                    className="p-1 text-gray-400 hover:text-red-500"
                    title="Supprimer le code"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ex: YOPPRINT15"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === 'Enter' && handleApplyPromoCode()}
                      className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono outline-none focus:border-primary uppercase"
                    />
                    <button
                      type="button"
                      onClick={handleApplyPromoCode}
                      disabled={promoLoading || !promoInput.trim()}
                      className="px-3 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-gray-800 disabled:opacity-40"
                    >
                      {promoLoading ? <Loader2 size={12} className="animate-spin" /> : 'OK'}
                    </button>
                  </div>
                  {promoErr && <p className="text-2xs text-red-500 font-medium">{promoErr}</p>}
                </div>
              )}
            </div>

            {/* Récapitulatif commande */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs sticky top-24">
              <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                <h3 className="font-bold text-gray-900 text-sm">
                  Votre commande
                </h3>
                <span className="text-xs text-gray-400">
                  {items.length} article{items.length > 1 ? 's' : ''}
                </span>
              </div>
              <div className="p-5 space-y-3.5">
                <div className="max-h-56 overflow-y-auto divide-y divide-gray-100 pr-1">
                  {items.map((item) => (
                    <div key={item.id} className="py-2.5 flex items-start gap-3">
                      <span className="text-xl shrink-0">{item.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-900 truncate">{item.productName}</p>
                        <p className="text-2xs text-gray-400">{fmt(item.quantity)} pièces · {item.formatLabel}</p>
                      </div>
                      <p className="text-xs font-bold text-gray-900 shrink-0">{fmt(item.price)} F</p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-100 pt-3 space-y-2 text-xs">
                  <div className="flex justify-between text-gray-500">
                    <span>Sous-total</span>
                    <span>{fmt(total)} FCFA</span>
                  </div>
                  {effectiveDiscount > 0 && (
                    <div className="flex justify-between text-green-600 font-bold">
                      <span>{useResellerDiscount ? `Remise revendeur (−${resellerRate} %)` : 'Remise'}</span>
                      <span>−{fmt(effectiveDiscount)} FCFA</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-500">
                    <span>Livraison ({zone.label})</span>
                    <span>{deliveryCost === 0 ? '🎁 Gratuite' : `${fmt(deliveryCost)} FCFA`}</span>
                  </div>
                  <div className="border-t border-gray-100 pt-2 flex justify-between font-extrabold text-gray-900 text-base">
                    <span>Total net</span>
                    <span className="text-primary">{fmt(amountDue)} FCFA</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-100 space-y-2">
                  <div className="flex items-center gap-2 text-2xs text-gray-500">
                    <span>🟠</span> <span>Orange Money (#144#)</span>
                  </div>
                  <div className="flex items-center gap-2 text-2xs text-gray-500">
                    <span>🔵</span> <span>Moov Money (*555#)</span>
                  </div>
                  <div className="flex items-center gap-2 text-2xs text-gray-500">
                    <span>💳</span> <span>Carte bancaire CinetPay</span>
                  </div>
                </div>
              </div>
            </div>

          </aside>
        </div>
      </div>

      {previewBatUrl && (
        <BatPreviewModal
          isOpen={!!previewBatUrl}
          onClose={() => setPreviewBatUrl(null)}
          fileUrl={previewBatUrl}
        />
      )}
    </div>
  )
}
