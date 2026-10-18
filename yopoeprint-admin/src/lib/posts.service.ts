import { api } from './index'

// Contrat de l'API : yopoeprint-api/src/modules/posts (contenu en Markdown)
export interface Post {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  category: string
  author: string
  imageUrl: string | null
  published: boolean
  publishedAt: string | null
  updatedAt: string
  readMinutes: number
}

export type PostInput = Pick<Post, 'slug' | 'title' | 'excerpt' | 'content' | 'category' | 'author' | 'imageUrl' | 'published'>

export const postsService = {
  list: () => api.get<Post[]>('/admin/posts'),
  create: (data: PostInput) => api.post<Post>('/admin/posts', data),
  update: (id: string, data: Partial<PostInput>) => api.patch<Post>(`/admin/posts/${id}`, data),
  remove: (id: string) => api.delete(`/admin/posts/${id}`),
}
