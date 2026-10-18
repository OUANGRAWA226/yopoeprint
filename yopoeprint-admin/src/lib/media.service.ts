// Envoi d'images du back-office par l'API (POST /admin/media), qui signe l'envoi vers Cloudinary.
// Remplace l'ancien envoi direct du navigateur avec un preset Cloudinary non signé.
const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'

export type MediaFolder = 'products' | 'blog' | 'bat'

// Limites de l'API : images JPG/PNG de 10 Mo ; un BAT peut aussi être un PDF de 50 Mo
const RULES: Record<MediaFolder, { ext: RegExp; maxSize: number; formats: string }> = {
  products: { ext: /\.(jpe?g|png)$/i,     maxSize: 10 * 1024 * 1024, formats: 'JPG ou PNG' },
  blog:     { ext: /\.(jpe?g|png)$/i,     maxSize: 10 * 1024 * 1024, formats: 'JPG ou PNG' },
  bat:      { ext: /\.(jpe?g|png|pdf)$/i, maxSize: 50 * 1024 * 1024, formats: 'JPG, PNG ou PDF' },
}

/** Envoie le fichier et renvoie son URL Cloudinary ; `onProgress` reçoit un pourcentage. */
export function uploadMedia(file: File, folder: MediaFolder, onProgress?: (percent: number) => void): Promise<string> {
  return new Promise((resolve, reject) => {
    const rule = RULES[folder]
    if (!rule.ext.test(file.name)) return reject(new Error(`Formats acceptés : ${rule.formats}`))
    if (file.size > rule.maxSize) return reject(new Error(`Fichier trop lourd (${rule.maxSize / 1024 / 1024} Mo maximum)`))

    const form = new FormData()
    form.append('file', file)
    const xhr = new XMLHttpRequest()
    xhr.open('POST', `${BASE}/admin/media?folder=${folder}`)
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_auth_token') : null
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
