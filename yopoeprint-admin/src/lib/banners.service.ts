import { api } from './index'

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'

// Contrat de l'API : yopoeprint-api/src/modules/banners
export interface Banner {
  id: string
  title: string
  subtitle: string | null
  badge: string | null
  ctaLabel: string | null
  altText: string | null
  imageUrl: string
  mobileImageUrl: string | null
  linkUrl: string
  order: number
  active: boolean
  startDate: string | null
  endDate: string | null
}

export type BannerInput = Omit<Banner, 'id' | 'order'>
export type BannerVariant = 'desktop' | 'mobile'

// Formats imposés par l'API (BANNER_FORMATS) : une image d'une autre taille est refusée
export const BANNER_FORMATS: Record<BannerVariant, { width: number; height: number; label: string }> = {
  desktop: { width: 1248, height: 357, label: 'ordinateur' },
  mobile:  { width: 660,  height: 330, label: 'téléphone' },
}

/** Dimensions réelles du fichier, lues dans le navigateur avant l'envoi. */
export function readImageSize(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => { resolve({ width: img.naturalWidth, height: img.naturalHeight }); URL.revokeObjectURL(url) }
    img.onerror = () => { reject(new Error('Image illisible : choisissez un fichier JPG ou PNG')); URL.revokeObjectURL(url) }
    img.src = url
  })
}

/** Envoie un visuel ; l'API vérifie à nouveau les dimensions exactes avant Cloudinary. */
function uploadImage(file: File, variant: BannerVariant, onProgress?: (percent: number) => void): Promise<string> {
  return new Promise((resolve, reject) => {
    const form = new FormData()
    form.append('image', file)
    const xhr = new XMLHttpRequest()
    xhr.open('POST', `${BASE}/admin/banners/image?variant=${variant}`)
    const token = localStorage.getItem('admin_auth_token')
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`)
    xhr.upload.onprogress = (e) => { if (e.lengthComputable) onProgress?.(Math.round((e.loaded / e.total) * 100)) }
    xhr.onload = () => {
      let data: any = null
      try { data = JSON.parse(xhr.responseText) } catch { /* réponse vide */ }
      if (xhr.status >= 200 && xhr.status < 300 && data?.url) resolve(data.url)
      else reject(new Error(data?.message || `Envoi impossible (erreur ${xhr.status})`))
    }
    xhr.onerror = () => reject(new Error('Erreur réseau pendant l\'envoi de l\'image'))
    xhr.send(form)
  })
}

export const bannersService = {
  list: () => api.get<Banner[]>('/admin/banners'),
  create: (data: BannerInput) => api.post<Banner>('/admin/banners', data),
  update: (id: string, data: Partial<BannerInput>) => api.patch<Banner>(`/admin/banners/${id}`, data),
  remove: (id: string) => api.delete(`/admin/banners/${id}`),
  reorder: (ids: string[]) => api.put<Banner[]>('/admin/banners/order', { ids }),
  uploadImage,
}
