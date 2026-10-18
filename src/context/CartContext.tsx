'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { promoService, PromoCodeResult, computeDiscount } from '@/lib/promo.service'

export interface CartItem {
  id: string
  productId: string
  productName: string
  emoji: string
  formatId: string
  formatLabel: string
  paperId: string
  paperLabel: string
  quantity: number
  rectoverso: boolean
  finition: string
  price: number
  unitPrice: number
  fileUrl?: string
  fileName?: string
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  updateQty: (id: string, qty: number) => void
  clearCart: () => void
  total: number
  itemCount: number
  // Promo state shared across CartDrawer, /panier and /commande
  appliedPromo: PromoCodeResult | null
  discount: number
  finalTotal: number
  applyPromo: (code: string) => Promise<{ success: boolean; message: string; discount?: number }>
  removePromo: () => void
  // Drawer
  isCartOpen: boolean
  openCart: () => void
  closeCart: () => void
}

const CartContext = createContext<CartContextType | null>(null)
const STORAGE_KEY = 'yopoeprint_cart'
const PROMO_STORAGE_KEY = 'yopoeprint_cart_promo'

function safeGetStorage(key: string): string | null {
  if (typeof window === 'undefined') return null
  try {
    return localStorage.getItem(key) || sessionStorage.getItem(key)
  } catch {
    return null
  }
}

function safeSetStorage(key: string, value: string): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, value)
  } catch {
    try { sessionStorage.setItem(key, value) } catch {}
  }
}

function safeRemoveStorage(key: string): void {
  if (typeof window === 'undefined') return
  try { localStorage.removeItem(key) } catch {}
  try { sessionStorage.removeItem(key) } catch {}
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [appliedPromo, setAppliedPromo] = useState<PromoCodeResult | null>(null)
  const [isCartOpen, setIsCartOpen] = useState(false)

  // Restaurer le panier et le code promo au démarrage
  useEffect(() => {
    try {
      const savedItems = safeGetStorage(STORAGE_KEY)
      if (savedItems) setItems(JSON.parse(savedItems))

      const savedPromo = safeGetStorage(PROMO_STORAGE_KEY)
      if (savedPromo) setAppliedPromo(JSON.parse(savedPromo))
    } catch (e) {
      console.warn('Erreur lors de la lecture du panier local:', e)
    }
  }, [])

  // Sauvegarder les articles à chaque modification
  useEffect(() => {
    try {
      safeSetStorage(STORAGE_KEY, JSON.stringify(items))
    } catch {}
  }, [items])

  // Sauvegarder le code promo
  useEffect(() => {
    try {
      if (appliedPromo) {
        safeSetStorage(PROMO_STORAGE_KEY, JSON.stringify(appliedPromo))
      } else {
        safeRemoveStorage(PROMO_STORAGE_KEY)
      }
    } catch {}
  }, [appliedPromo])

  // Bloquer le scroll body quand le drawer est ouvert
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isCartOpen])

  const addItem = (item: CartItem) => {
    setItems((prev) => {
      const exists = prev.find((i) => i.id === item.id)
      if (exists) {
        return prev.map((i) =>
          i.id === item.id
            ? { ...i, quantity: i.quantity + item.quantity, price: i.price + item.price }
            : i
        )
      }
      return [...prev, item]
    })
  }

  const removeItem = (id: string) =>
    setItems((prev) => prev.filter((i) => i.id !== id))

  const updateQty = (id: string, qty: number) =>
    setItems((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, quantity: qty, price: i.unitPrice * qty } : i
      )
    )

  const clearCart = () => {
    setItems([])
    setAppliedPromo(null)
    safeRemoveStorage(STORAGE_KEY)
    safeRemoveStorage(PROMO_STORAGE_KEY)
  }

  const openCart = () => setIsCartOpen(true)
  const closeCart = () => setIsCartOpen(false)

  const total = items.reduce((sum, i) => sum + i.price, 0)
  const itemCount = items.reduce((sum, i) => sum + 1, 0)
  const discount = appliedPromo ? computeDiscount(appliedPromo, total) : 0
  const finalTotal = Math.max(0, total - discount)

  const applyPromo = async (code: string) => {
    const cleanCode = code.trim().toUpperCase()
    if (!cleanCode) {
      return { success: false, message: 'Veuillez saisir un code promo.' }
    }
    try {
      const result = await promoService.validate(cleanCode, total)
      if (result.isValid) {
        setAppliedPromo(result)
        const disc = computeDiscount(result, total)
        return {
          success: true,
          message: result.discountType === 'percentage'
            ? `${result.discountValue}% de réduction appliquée !`
            : `${disc.toLocaleString('fr-FR')} FCFA de réduction appliquée !`,
          discount: disc,
        }
      } else {
        return { success: false, message: 'Code promo invalide ou expiré.' }
      }
    } catch (err) {
      return { success: false, message: 'Impossible de valider ce code promo pour le moment.' }
    }
  }

  const removePromo = () => {
    setAppliedPromo(null)
    safeRemoveStorage(PROMO_STORAGE_KEY)
  }

  return (
    <CartContext.Provider value={{
      items, addItem, removeItem, updateQty, clearCart,
      total, itemCount,
      appliedPromo, discount, finalTotal,
      applyPromo, removePromo,
      isCartOpen, openCart, closeCart,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
