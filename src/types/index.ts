// ─── Product Types ────────────────────────────────────────────
export type ProductCategory =
 | 'flyers'
 | 'cartes-de-visite'
 | 'affiches'
 | 'brochures'
 | 'roll-up'
 | 'goodies'
 | 'textile'
 | 'evenementiel'
 | 'signaletique'
 | 'corporate'

export type ProductBadge = 'popular' | 'new' | 'promo' | null

export interface ProductOption {
 id: string
 label: string
 value: string
 priceModifier?: number // additional FCFA
}

export interface ProductFormat {
 id: string
 label: string // e.g. "A5"
 dimensions: string // e.g. "148×210mm"
}

export interface ProductPaper {
 id: string
 label: string // e.g. "Couché mat 135g"
 description: string
}

export interface Product {
 id: string
 slug: string
 name: string
 description: string
 shortDesc: string
 category: ProductCategory
 badge: ProductBadge
 emoji: string
 bgGradient: string
 basePrice: number // FCFA
 minQuantity: number
 formats: ProductFormat[]
 papers: ProductPaper[]
 quantities: number[]
 finishes: ProductOption[]
 deliveryDays: number
 popular: boolean
 imageUrl?: string
 images?: Array<{ id: string; label: string; description: string; url: string; order: number }>
 rating?: number
 reviewsCount?: number
}

// ─── Cart Types ───────────────────────────────────────────────
export interface CartItem {
 id: string
 product: Product
 quantity: number
 format: ProductFormat
 paper: ProductPaper
 finish: ProductOption | null
 rectoverso: boolean
 designFile?: string
 unitPrice: number
 totalPrice: number
}

export interface Cart {
 items: CartItem[]
 total: number
 itemCount: number
}

// ─── Order Types ──────────────────────────────────────────────
export type OrderStatus =
 | 'pending'
 | 'confirmed'
 | 'in_production'
 | 'shipped'
 | 'delivered'
 | 'cancelled'

export interface Order {
 id: string
 orderNumber: string
 status: OrderStatus
 items: CartItem[]
 total: number
 deliveryAddress: Address
 paymentMethod: PaymentMethod
 createdAt: string
 updatedAt: string
 estimatedDelivery: string
}

// ─── User Types ───────────────────────────────────────────────
export interface User {
 id: string
 firstName: string
 lastName: string
 email: string
 phone: string
 addresses: Address[]
 loyaltyPoints: number
 orders: Order[]
 createdAt: string
}

export interface Address {
 id: string
 label: string // "Domicile", "Bureau", etc.
 fullName: string
 phone: string
 street: string
 neighborhood: string
 city: string
 isDefault: boolean
}

// ─── Payment Types ────────────────────────────────────────────
export type PaymentMethod =
 | 'orange-money'
 | 'moov-money'
 | 'visa'
 | 'mastercard'
 | 'virement'

export interface PaymentOption {
 id: PaymentMethod
 label: string
 icon: string
 description: string
 available: boolean
}

// ─── Quote Types ──────────────────────────────────────────────
export interface QuoteRequest {
 id: string
 companyName: string
 contactName: string
 email: string
 phone: string
 productType: string
 quantity: number
 description: string
 deadline: string
 status: 'pending' | 'processed' | 'sent' | 'accepted' | 'declined'
 createdAt: string
}

// ─── Navigation Types ─────────────────────────────────────────
export interface NavCategory {
 label: string
 slug: string
 emoji: string
 href: string
}

// ─── API Response Types ───────────────────────────────────────
export interface ApiResponse<T> {
 data: T
 message: string
 success: boolean
}

export interface PaginatedResponse<T> {
 data: T[]
 total: number
 page: number
 limit: number
 hasMore: boolean
}
