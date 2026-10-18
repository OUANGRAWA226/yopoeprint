// Articles du blog, gérés dans l'admin (Blog) et servis par l'API (yopoeprint-api/src/modules/posts).
// Le contenu arrive déjà rendu en HTML par l'API, à partir du Markdown échappé : aucun HTML saisi ne passe tel quel.

export interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  category: string
  author: string
  date: string
  readTime: string
  imageUrl: string
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'

// Visuel affiché quand l'article n'a pas d'image de couverture
const FALLBACK_COVER = '/images/products/brochures-catalogues.jpg'

type ApiPost = Omit<BlogPost, 'imageUrl'> & { imageUrl: string | null }
const withCover = (p: ApiPost): BlogPost => ({ ...p, imageUrl: p.imageUrl || FALLBACK_COVER })

// Pages serveur : un article publié dans l'admin apparaît au plus tard une minute après
async function getJson<T>(path: string): Promise<T | null> {
  const res = await fetch(`${API_URL}${path}`, { next: { revalidate: 60 } })
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`API ${res.status} sur ${path}`)
  return res.json()
}

export const getBlogPosts = async (): Promise<BlogPost[]> => {
  try {
    const data = await getJson<ApiPost[]>('/posts')
    return Array.isArray(data) ? data.map(withCover) : []
  } catch (err) {
    console.error('Articles du blog indisponibles', err)
    return []
  }
}

export const getBlogPostBySlug = async (slug: string): Promise<BlogPost | null> => {
  try {
    const data = await getJson<ApiPost>(`/posts/slug/${encodeURIComponent(slug)}`)
    return data ? withCover(data) : null
  } catch (err) {
    console.error(`Article ${slug} indisponible`, err)
    return null
  }
}
