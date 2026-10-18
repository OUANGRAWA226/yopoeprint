// ─── Export unique de tous les services ───────────────────────
// Dans vos composants, importez depuis '@/lib' directement

export { api } from './api'
export { authService } from './auth.service'
export { saveAuth, clearAuth, isAuthenticated } from './api'

// Fonctions produits pour utilisation directe
export { 
 getAllProducts,
 getProductById,
 getProductBySlug,
 createProduct,
 updateProduct,
 toggleProductActive,
 deleteProduct,
 uploadProductImage
} from './products.service'

// Types
export type { RegisterData, LoginData, AuthUser, AuthResponse } from './auth.service'
export type { CreateOrderPayload, DeliveryAddress } from './orders.service'
