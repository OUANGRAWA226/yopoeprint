'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/hooks/useAuth'
import {
  ShoppingBag, Trash2, Plus, Minus,
  ArrowRight, Tag, ChevronRight, ShieldCheck,
  Truck, Package, Check
} from 'lucide-react'

function fmt(n: number) {
  return new Intl.NumberFormat('fr-FR').format(n)
}

const FREE_DELIVERY = 75000
const DELIVERY_FEE  = 3500

export default function PanierPage() {
  const { items, removeItem, updateQty, total, clearCart } = useCart()
  const { user } = useAuth()
  const [promo, setPromo]               = useState('')
  const [promoErr, setPromoErr]         = useState('')
  const [discount, setDiscount]         = useState(0)
  const [promoApplied, setPromoApplied] = useState('')

  const delivery   = total >= FREE_DELIVERY ? 0 : DELIVERY_FEE
  const finalTotal = total - discount + delivery
  const remaining  = FREE_DELIVERY - total
  const progress   = Math.min((total / FREE_DELIVERY) * 100, 100)

  const applyPromo = () => {
    const CODES: Record<string, number> = {
      'YOPPRINT15': 0.15,
      'YOPOE10': 0.10,
      'PROMO20': 0.20,
      'BURKINA': 0.15,
    }
    const code = promo.trim().toUpperCase()
    if (CODES[code]) {
      setDiscount(Math.round(total * CODES[code]))
      setPromoApplied(code)
      setPromoErr('')
    } else {
      setPromoErr('Code promo invalide ou expiré')
      setDiscount(0)
      setPromoApplied('')
    }
  }

  // ── Panier vide ─────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center text-5xl mx-auto mb-6">
            🛒
          </div>
          <h2 className="font-display text-2xl font-bold text-gray-900 mb-2">
            Votre panier est vide
          </h2>
          <p className="text-gray-400 text-sm mb-8">
            Ajoutez des produits depuis notre catalogue pour commencer votre commande.
          </p>
          <Link
            href="/catalogue"
            className="inline-flex items-center gap-2 bg-primary text-white font-bold px-6 py-3.5 rounded-xl text-sm hover:bg-primary/90 transition-all"
          >
            Découvrir le catalogue <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8F8F8]">

      {/* ── Header ───────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-4">

          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-3">
            <Link href="/" className="hover:text-gray-700 transition-colors">Accueil</Link>
            <ChevronRight size={12} />
            <span className="text-gray-900 font-semibold">Mon panier</span>
          </div>

          <div className="flex items-center justify-between mb-4">
            <h1 className="font-display text-xl md:text-2xl font-extrabold text-gray-900 flex items-center gap-2.5">
              <ShoppingBag size={22} className="text-primary" />
              Mon panier
              <span className="text-sm font-normal text-gray-400 ml-1">
                ({items.length} article{items.length > 1 ? 's' : ''})
              </span>
            </h1>
            <button
              onClick={clearCart}
              className="text-xs text-gray-400 hover:text-red-500 transition-colors underline underline-offset-4"
            >
              Tout vider
            </button>
          </div>

          {/* Stepper */}
          <div className="flex items-center gap-0">
            {[
              { n: 1, label: 'Panier', done: true,  active: true  },
              { n: 2, label: 'Livraison', done: false, active: false },
              { n: 3, label: 'Paiement', done: false, active: false },
            ].map((s, i) => (
              <div key={s.n} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center gap-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all
                    ${s.active ? 'bg-gray-900 text-white ring-4 ring-gray-900/10' : 'bg-gray-100 text-gray-400'}`}>
                    {s.done && s.active ? <Check size={14} strokeWidth={3} /> : s.n}
                  </div>
                  <span className={`text-[10px] font-bold whitespace-nowrap ${s.active ? 'text-gray-900' : 'text-gray-400'}`}>
                    {s.label}
                  </span>
                </div>
                {i < 2 && (
                  <div className="h-0.5 flex-1 mx-2 mb-4 rounded-full bg-gray-100" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-6 py-5 md:py-8">

        {/* ── Barre livraison gratuite ─────────────────────── */}
        {remaining > 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-4 mb-5 flex items-center gap-4">
            <Truck size={20} className="text-gray-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-700 mb-1.5">
                Plus que <strong className="text-primary">{fmt(remaining)} FCFA</strong> pour la livraison gratuite
              </p>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-700"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-5 flex items-center gap-3">
            <span className="text-xl">🎁</span>
            <p className="text-sm font-bold text-green-700">Livraison gratuite débloquée !</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5">

          {/* ── Articles ─────────────────────────────────────── */}
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden"
              >
                <div className="flex gap-4 p-4 md:p-5">

                  {/* Emoji / image */}
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center text-3xl md:text-4xl shrink-0">
                    {item.emoji}
                  </div>

                  {/* Infos */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-bold text-gray-900 text-[14px] md:text-[15px] leading-tight">
                        {item.productName}
                      </h3>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all shrink-0"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    {/* Tags options */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {[
                        item.formatLabel,
                        item.paperLabel,
                        item.rectoverso ? 'Recto/Verso' : 'Recto seul',
                        item.finition !== 'none' && item.finition !== 'Sans finition' ? item.finition : null,
                      ].filter(Boolean).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-[11px] font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Qty + Prix */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-1.5 bg-gray-100 rounded-xl p-1">
                        <button
                          onClick={() => updateQty(item.id, Math.max(1, item.quantity - 100))}
                          className="w-7 h-7 flex items-center justify-center bg-white rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="font-mono font-bold text-gray-900 text-sm w-16 text-center">
                          {fmt(item.quantity)}
                        </span>
                        <button
                          onClick={() => updateQty(item.id, item.quantity + 100)}
                          className="w-7 h-7 flex items-center justify-center bg-white rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
                        >
                          <Plus size={13} />
                        </button>
                        <span className="text-[11px] text-gray-400 pr-1">ex.</span>
                      </div>

                      <div className="text-right">
                        <p className="text-[11px] text-gray-400">{fmt(item.unitPrice)} FCFA/u</p>
                        <p className="font-display font-extrabold text-gray-900 text-base leading-tight">
                          {fmt(item.price)} <span className="text-xs font-normal text-gray-400">FCFA</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <Link
              href="/catalogue"
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 font-semibold hover:text-primary transition-colors mt-1"
            >
              ← Continuer mes achats
            </Link>
          </div>

          {/* ── Sidebar : Code promo + Récap ──────────────── */}
          <aside className="space-y-4">

            {/* Code promo */}
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Tag size={15} className="text-primary" />
                <h3 className="font-bold text-gray-900 text-[14px]">Code promo</h3>
              </div>
              {promoApplied ? (
                <div className="flex items-center justify-between px-3 py-2.5 bg-green-50 border border-green-200 rounded-xl">
                  <span className="text-green-700 font-bold text-sm flex items-center gap-1.5">
                    <Check size={14} strokeWidth={3} /> {promoApplied} appliqué
                  </span>
                  <button
                    onClick={() => { setDiscount(0); setPromoApplied(''); setPromo('') }}
                    className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                  >
                    Retirer
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ex: YOPPRINT15"
                      value={promo}
                      onChange={(e) => setPromo(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === 'Enter' && applyPromo()}
                      className="flex-1 px-3 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm font-mono outline-none focus:border-primary uppercase transition-all"
                    />
                    <button
                      onClick={applyPromo}
                      className="px-4 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-gray-800 transition-all"
                    >
                      Appliquer
                    </button>
                  </div>
                  {promoErr && <p className="text-xs text-red-500 mt-1.5">{promoErr}</p>}
                </>
              )}
            </div>

            {/* Récapitulatif */}
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <h3 className="font-bold text-gray-900 text-[14px] mb-4">Récapitulatif</h3>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Sous-total</span>
                  <span className="font-semibold text-gray-900">{fmt(total)} FCFA</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Réduction ({promoApplied})</span>
                    <span className="font-bold">−{fmt(discount)} FCFA</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Livraison</span>
                  <span className={delivery === 0 ? 'text-green-600 font-semibold' : 'font-semibold text-gray-900'}>
                    {delivery === 0 ? '🎁 Offerte' : `${fmt(delivery)} FCFA`}
                  </span>
                </div>
                {total < FREE_DELIVERY && (
                  <p className="text-[11px] text-gray-400 bg-gray-50 rounded-lg px-3 py-2">
                    Livraison offerte dès {fmt(FREE_DELIVERY)} FCFA d&apos;achat
                  </p>
                )}
              </div>

              {/* Séparateur + Total */}
              <div className="border-t border-gray-100 mt-4 pt-4 flex justify-between items-center">
                <span className="font-bold text-gray-900">Total TTC</span>
                <div className="text-right">
                  <p className="font-display font-extrabold text-gray-900 text-2xl leading-none">
                    {fmt(finalTotal)}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">FCFA</p>
                </div>
              </div>

              {/* CTA Commander */}
              <Link
                href={user ? '/commande' : '/connexion?redirect=/commande'}
                className="mt-4 w-full flex items-center justify-center gap-2 bg-[#FF6B00] text-white py-4 rounded-xl font-bold text-[15px] hover:bg-[#E66000] active:scale-[0.98] transition-all shadow-md"
              >
                Commander <ArrowRight size={18} />
              </Link>

              {!user && (
                <p className="text-center text-xs text-gray-400 mt-2">
                  Connexion requise pour continuer
                </p>
              )}
            </div>

            {/* Réassurance */}
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 space-y-2.5">
              {[
                { icon: <ShieldCheck size={15} className="text-green-600" />, text: 'Paiement 100% sécurisé' },
                { icon: <span className="text-base leading-none">🟠</span>, text: 'Orange Money & Moov Money' },
                { icon: <Package size={15} className="text-primary" />, text: 'Livraison 24-48h à Ouagadougou' },
              ].map((it, i) => (
                <div key={i} className="flex items-center gap-2.5 text-xs text-gray-600 font-medium">
                  {it.icon}
                  {it.text}
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
