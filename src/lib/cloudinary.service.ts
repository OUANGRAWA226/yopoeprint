/**
 * Service Cloudinary pour upload d'images et maquettes (mode unsigned)
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
   * Upload un fichier (image ou PDF) vers Cloudinary
   */
  async uploadFile(file: File, onProgress?: (progress: number) => void): Promise<string> {
    const maxSize = 20 * 1024 * 1024 // 20 MB
    if (file.size > maxSize) {
      throw new Error(`Le fichier ne doit pas dépasser 20 MB (actuellement: ${(file.size / 1024 / 1024).toFixed(2)} MB)`)
    }

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      const formData = new FormData()

      formData.append('file', file)
      formData.append('upload_preset', UPLOAD_PRESET)
      formData.append('folder', 'yopoeprint/bat')
      formData.append('resource_type', 'auto')

      if (onProgress) {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percentComplete = Math.round((e.loaded / e.total) * 100)
            onProgress(percentComplete)
          }
        })
      }

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response: CloudinaryResponse = JSON.parse(xhr.responseText)
            resolve(response.secure_url)
          } catch (e) {
            reject(new Error('Erreur lors du parsing de la réponse Cloudinary'))
          }
        } else {
          try {
            const errorResponse = JSON.parse(xhr.responseText)
            reject(new Error(errorResponse.error?.message || `Erreur ${xhr.status}`))
          } catch (e) {
            reject(new Error(`Erreur ${xhr.status}: ${xhr.statusText}`))
          }
        }
      })

      xhr.addEventListener('error', () => reject(new Error('Erreur réseau lors de l\'upload')))
      xhr.addEventListener('abort', () => reject(new Error('Upload annulé')))

      const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`
      xhr.open('POST', uploadUrl, true)
      xhr.send(formData)
    })
  },
}
