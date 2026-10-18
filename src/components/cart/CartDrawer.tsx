'use client'

import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import { X, ShoppingBag, Trash2, Minus, Plus, ArrowRight, ChevronRight, FileText, Tag, Check, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { DevisPdfGenerator } from '@/components/checkout/DevisPdfGenerator'
import { promoService, PromoCodeResult, computeDiscount } from '@/lib/promo.service'
import { useToast } from '@/context/ToastContext'
import { usePublicSettings } from '@/lib/settings.service'

function fmt(n: number) {
  return new Intl.NumberFormat('fr-FR').format(n)
}

export function CartDrawer() {
  const {
    items, removeItem, updateQty, total, itemCount,
    isCartOpen, closeCart,
    appliedPromo, discount, finalTotal,
    applyPromo, removePromo,
  } = useCart()
  const [isDevisOpen, setIsDevisOpen] = useState(false)
  const toast = useToast()

  // ── Promo Code Input State ────────────────────────────────────
  const [promoInput, setPromoInput] = useState('')
  const [promoLoading, setPromoLoading] = useState(false)

  const handleApplyPromo = async () => {
    const code = promoInput.trim().toUpperCase()
    if (!code) return
    setPromoLoading(true)
    try {
      const res = await applyPromo(code)
      if (res.success) {
        setPromoInput('')
        toast.success(`Code « ${code} » appliqué !`, res.message)
      } else {
        toast.error('Code invalide', res.message)
      }
    } catch {
      toast.error('Erreur réseau', 'Impossible de vérifier le code. Réessayez.')
    } finally {
      setPromoLoading(false)
    }
  }

  const handleRemovePromo = () => {
    removePromo()
    toast.info('Code promo retiré', 'Le tarif normal a été restauré.')
  }

  const { settings } = usePublicSettings()
  const freeThreshold = settings?.delivery.freeThreshold ?? 0
  const remaining = freeThreshold - total
  const progress = freeThreshold > 0 ? Math.min((total / freeThreshold) * 100, 100) : 0

  return (
    <>
      {/* ── Overlay ───────────────────────────────────────── */}
      <div
        onClick={closeCart}
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300
          ${isCartOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      />

      {/* ── Drawer Panel ──────────────────────────────────── */}
      <aside
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-[420px] bg-white shadow-2xl
          flex flex-col transition-all duration-300 ease-in-out
          ${isCartOpen ? 'translate-x-0 visible' : 'translate-x-full invisible pointer-events-none'}`}
      >
        {/* ── Header ──────────────────────────────────────── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <ShoppingBag size={20} className="text-gray-700" />
            <h2 className="font-bold text-gray-900 text-base">
              Mon panier
              {itemCount > 0 && (
                <span className="ml-2 text-xs font-bold bg-primary text-white px-2 py-0.5 rounded-full">
                  {itemCount}
                </span>
              )}
            </h2>
          </div>
          <button
            onClick={closeCart}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Barre livraison gratuite ─────────────────────── */}
        {items.length > 0 && freeThreshold > 0 && (
          <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
            {remaining > 0 ? (
              <>
                <p className="text-xs text-gray-600 mb-1.5">
                  ➕ Plus que <strong className="text-primary">{fmt(remaining)} FCFA</strong> pour la livraison offerte
                </p>
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </>
            ) : (
              <p className="text-xs font-bold text-primary flex items-center gap-2">
                🎁 Livraison gratuite débloquée !
              </p>
            )}
          </div>
        )}

        {/* ── Corps ───────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto">

          {/* Panier vide */}
          {items.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full px-8 text-center gap-4">
              <span className="text-7xl">🛒</span>
              <h3 className="font-bold text-gray-900 text-lg">Votre panier est vide</h3>
              <p className="text-gray-400 text-sm">Ajoutez des produits depuis notre catalogue.</p>
              <button
                onClick={closeCart}
                className="mt-2 text-primary font-bold text-sm underline underline-offset-4"
              >
                Continuer mes achats
              </button>
            </div>
          )}

          {/* Liste articles */}
          {items.length > 0 && (
            <ul className="divide-y divide-gray-50 px-5">
              {items.map((item) => (
                <li key={item.id} className="py-4 flex gap-3">
                  {/* Emoji */}
                  <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center text-2xl shrink-0">
                    {item.emoji}
                  </div>

                  {/* Infos */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-sm leading-tight truncate">
                      {item.productName}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {[
                        item.formatLabel,
                        item.paperLabel,
                        item.rectoverso ? 'R/V' : 'Recto',
                      ].filter(Boolean).map((tag) => (
                        <span key={tag} className="text-2xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Qty + Prix */}
                    <div className="flex items-center justify-between mt-2.5">
                      <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                        <button
                          onClick={() => updateQty(item.id, Math.max(1, item.quantity - 100))}
                          className="w-6 h-6 flex items-center justify-center rounded hover:bg-white transition-colors"
                        >
                          <Minus size={11} />
                        </button>
                        <span className="text-xs font-bold text-gray-900 w-14 text-center">
                          {fmt(item.quantity)}
                        </span>
                        <button
                          onClick={() => updateQty(item.id, item.quantity + 100)}
                          className="w-6 h-6 flex items-center justify-center rounded hover:bg-white transition-colors"
                        >
                          <Plus size={11} />
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <p className="font-bold text-gray-900 text-sm">
                          {fmt(item.price)} <span className="text-2xs text-gray-400 font-normal">FCFA</span>
                        </p>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="w-6 h-6 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 rounded transition-all"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ── Footer : Total + CTAs ────────────────────────── */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 px-5 pt-4 pb-6 bg-white space-y-3">

            {/* ── Promo Code ── */}
            <div>
              {appliedPromo ? (
                <div className="flex items-center justify-between px-3 py-2.5 bg-green-50 border border-green-200 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Check size={14} className="text-green-600 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-green-800">{appliedPromo.code}</p>
                      <p className="text-2xs text-green-600">
                        {appliedPromo.discountType === 'percentage'
                          ? `−${appliedPromo.discountValue}%`
                          : `−${fmt(appliedPromo.discountValue)} FCFA`
                        } appliqué
                      </p>
                    </div>
                  </div>
                  <button onClick={handleRemovePromo} className="text-green-400 hover:text-red-500 transition-colors">
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Code promo"
                      value={promoInput}
                      onChange={e => setPromoInput(e.target.value.toUpperCase())}
                      onKeyDown={e => e.key === 'Enter' && handleApplyPromo()}
                      className="w-full pl-8 pr-3 py-2.5 text-sm border-2 border-gray-200 rounded-xl outline-none focus:border-primary transition-colors font-mono tracking-wider placeholder:font-sans placeholder:tracking-normal"
                    />
                  </div>
                  <button
                    onClick={handleApplyPromo}
                    disabled={promoLoading || !promoInput.trim()}
                    className="px-4 py-2.5 bg-gray-900 text-white text-xs font-bold rounded-xl hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5"
                  >
                    {promoLoading ? <Loader2 size={13} className="animate-spin" /> : 'Appliquer'}
                  </button>
                </div>
              )}
            </div>

            {/* Sous-total */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Sous-total ({itemCount} article{itemCount > 1 ? 's' : ''})</span>
              <span className="font-bold text-gray-900 text-base">{fmt(total)} FCFA</span>
            </div>
            {discount > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-green-600 font-semibold">Remise code promo</span>
                <span className="font-bold text-green-600">−{fmt(discount)} FCFA</span>
              </div>
            )}
            {discount > 0 && (
              <div className="flex items-center justify-between border-t border-gray-100 pt-2">
                <span className="text-sm font-bold text-gray-900">Total après remise</span>
                <span className="font-display font-extrabold text-lg text-primary">{fmt(finalTotal)} FCFA</span>
              </div>
            )}
            <p className="text-2xs text-gray-400">
              Livraison calculée à l'étape suivante
            </p>

            {/* CTA Commander */}
            <Link
              href="/commande"
              onClick={closeCart}
              className="flex items-center justify-center gap-2 w-full bg-primary text-white font-bold py-4 rounded-xl text-base hover:bg-primary/90 active:scale-[0.98] transition-all shadow-md"
            >
              Commander — {fmt(finalTotal)} FCFA <ArrowRight size={16} />
            </Link>

            {/* Bouton Devis PDF */}
            <button
              onClick={() => setIsDevisOpen(true)}
              className="flex items-center justify-center gap-2 w-full border-2 border-dashed border-indigo-200 text-indigo-600 font-bold py-3 rounded-xl text-sm hover:bg-indigo-50 hover:border-indigo-400 active:scale-[0.98] transition-all"
            >
              <FileText size={15} />
              Générer un Devis PDF
            </button>

            {/* Lien panier complet */}
            <Link
              href="/panier"
              onClick={closeCart}
              className="flex items-center justify-center gap-1 w-full text-gray-500 font-semibold text-sm hover:text-gray-800 transition-colors"
            >
              Voir le panier complet <ChevronRight size={14} />
            </Link>

            {/* Réassurance */}
            <div className="flex items-center justify-center gap-4 pt-1">
              {[
                { icon: '🟠', label: 'Orange Money' },
                { icon: '🔵', label: 'Moov Money' },
                { icon: '💳', label: 'Carte' },
              ].map(({ icon, label }) => (
                <span key={label} className="flex items-center gap-1 text-2xs text-gray-400">
                  <span>{icon}</span> {label}
                </span>
              ))}
            </div>
          </div>
        )}
      </aside>

      {/* ── Devis PDF Generator Modal ────────────────────── */}
      <DevisPdfGenerator
        isOpen={isDevisOpen}
        onClose={() => setIsDevisOpen(false)}
        items={items}
        total={total}
      />
    </>
  )
}
