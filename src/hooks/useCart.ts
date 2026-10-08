import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CartItem, Cart } from '@/types'

interface CartStore extends Cart {
 addItem: (item: CartItem) => void
 removeItem: (itemId: string) => void
 updateQty: (itemId: string, quantity: number) => void
 clearCart: () => void
}

export const useCartStore = create<CartStore>()(
 persist(
 (set, get) => ({
 items: [],
 total: 0,
 itemCount: 0,

 addItem: (item) => {
 const items = [...get().items, item]
 set({
 items,
 total: items.reduce((sum, i) => sum + i.totalPrice, 0),
 itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
 })
 },

 removeItem: (itemId) => {
 const items = get().items.filter((i) => i.id !== itemId)
 set({
 items,
 total: items.reduce((sum, i) => sum + i.totalPrice, 0),
 itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
 })
 },

 updateQty: (itemId, quantity) => {
 const items = get().items.map((i) =>
 i.id === itemId
 ? { ...i, quantity, totalPrice: i.unitPrice * quantity }
 : i
 )
 set({
 items,
 total: items.reduce((sum, i) => sum + i.totalPrice, 0),
 itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
 })
 },

 clearCart: () => set({ items: [], total: 0, itemCount: 0 }),
 }),
 { name: 'yopoeprint-cart' }
 )
)
