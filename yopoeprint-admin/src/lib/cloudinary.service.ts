/**
 * Service Cloudinary pour upload d'images
 */

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dtie3vgyz'
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'useProducts'

interface CloudinaryResponse {
  public_id: string
  version: number
  signature: string
  width: number
  height: number
  format: string
  resource_type: string
  created_at: string
  tags: string[]
  bytes: number
  type: string
  etag: string
  placeholder: boolean
  url: string
  secure_url: string
  folder: string
  original_filename: string
}

export const cloudinaryService = {
  /**
   * Upload une image vers Cloudinary (mode unsigned)
   * @param file - Le fichier à uploader
   * @param onProgress - Callback pour suivre la progression (0-100)
   * @returns L'URL de l'image uploadée
   */
  async uploadImage(file: File, onProgress?: (progress: number) => void): Promise<string> {
    console.log('[Cloudinary] 📤 Début upload d\'image')
    console.log('[Cloudinary] Fichier:', {
      name: file.name,
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      type: file.type,
    })

    // Vérifier la taille (max 5 MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      console.error('[Cloudinary] ❌ Fichier trop volumineux')
      throw new Error(`Le fichier ne doit pas dépasser 5 MB (actuellement: ${(file.size / 1024 / 1024).toFixed(2)} MB)`)
    }

    // Vérifier le type MIME
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      console.error('[Cloudinary] ❌ Type de fichier non supporté')
      throw new Error(`Type de fichier non supporté. Accepté: JPG, PNG, WebP, GIF`)
    }

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      const formData = new FormData()

      // Configuration du formulaire (mode unsigned avec preset)
      formData.append('file', file)
      formData.append('upload_preset', UPLOAD_PRESET)
      formData.append('folder', 'yopoeprint/products')
      formData.append('resource_type', 'auto')

      // Suivi de la progression
      if (onProgress) {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percentComplete = Math.round((e.loaded / e.total) * 100)
            console.log(`[Cloudinary] 📊 Progression: ${percentComplete}%`)
            onProgress(percentComplete)
          }
        })
      }

      // Gestion de la réponse
      xhr.addEventListener('load', () => {
        console.log(`[Cloudinary] Response status: ${xhr.status}`)
        
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response: CloudinaryResponse = JSON.parse(xhr.responseText)
            console.log('[Cloudinary] ✅ Upload réussi')
            console.log('[Cloudinary] URL:', response.secure_url)
            resolve(response.secure_url)
          } catch (e) {
            console.error('[Cloudinary] ❌ Erreur parsing réponse')
            reject(new Error('Erreur lors du parsing de la réponse Cloudinary'))
          }
        } else {
          try {
            const errorResponse = JSON.parse(xhr.responseText)
            console.error('[Cloudinary] ❌ Erreur serveur:', errorResponse)
            reject(new Error(errorResponse.error?.message || `Erreur ${xhr.status}`))
          } catch (e) {
            console.error('[Cloudinary] ❌ Erreur:', xhr.statusText)
            reject(new Error(`Erreur ${xhr.status}: ${xhr.statusText}`))
          }
        }
      })

      // Gestion des erreurs réseau
      xhr.addEventListener('error', () => {
        console.error('[Cloudinary] ❌ Erreur réseau')
        reject(new Error('Erreur réseau lors de l\'upload'))
      })

      xhr.addEventListener('abort', () => {
        console.error('[Cloudinary] ❌ Upload annulé')
        reject(new Error('Upload annulé par l\'utilisateur'))
      })

      // Envoi
      const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`
      console.log(`[Cloudinary] Envoi vers: ${uploadUrl}`)
      console.log(`[Cloudinary] Upload Preset: ${UPLOAD_PRESET}`)
      xhr.open('POST', uploadUrl, true)
      xhr.send(formData)
    })
  },

  /**
   * Génère une URL Cloudinary optimisée avec transformation
   * @param url - L'URL Cloudinary original
   * @param width - Largeur (optionnel)
   * @param height - Hauteur (optionnel)
   * @param quality - Qualité (optionnel, par défaut 'auto')
   * @returns L'URL transformée
   */
  getOptimizedUrl(url: string, width?: number, height?: number, quality: string = 'auto'): string {
    if (!url.includes('cloudinary')) return url

    // Exemple: https://res.cloudinary.com/CLOUD_NAME/image/upload/v1234/folder/file.jpg
    // Transformé en: https://res.cloudinary.com/CLOUD_NAME/image/upload/w_800,h_600,q_auto/v1234/folder/file.jpg

    let transforms = `q_${quality}`
    if (width) transforms += `,w_${width}`
    if (height) transforms += `,h_${height}`
    transforms += `,f_auto` // Format automatique

    return url.replace('/upload/', `/upload/${transforms}/`)
  },
}
