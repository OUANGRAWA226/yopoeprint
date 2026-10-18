import Link from 'next/link'
import Image from 'next/image'
import { getBlogPosts } from '@/lib/blog.service'
import { ArrowRight, Clock } from 'lucide-react'

export const metadata = {
  title: 'Blog & Ressources — YopoePrint',
  description: 'Découvrez nos conseils, tutoriels et inspirations pour réussir toutes vos impressions.',
}

export default async function BlogPage() {
  const posts = await getBlogPosts()

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        
        {/* Header */}
        <div className="max-w-3xl mb-16">
          <h1 className="font-display text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-4">
            Le Centre de Ressources
          </h1>
          <p className="text-lg md:text-xl text-gray-500 leading-relaxed">
            Astuces techniques, choix des papiers et tendances graphiques. Tout ce qu'il faut savoir pour une impression parfaite.
          </p>
        </div>

        {posts.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
            <p className="font-bold text-gray-900">Nos premiers articles arrivent bientôt.</p>
            <p className="text-sm text-gray-600 mt-1">
              En attendant, consultez notre <Link href="/guide-impression" className="text-primary font-bold hover:underline">guide de préparation des fichiers</Link>.
            </p>
          </div>
        )}

        {/* Featured Post (First one) */}
        {posts.length > 0 && (
          <div className="mb-12">
            <Link href={`/blog/${posts[0].slug}`} className="group block bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all">
              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="relative h-64 md:h-full w-full overflow-hidden">
                  <Image 
                    src={posts[0].imageUrl} 
                    alt={posts[0].title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-gray-900 text-xs font-bold rounded-full">
                      Nouveau
                    </span>
                  </div>
                </div>
                <div className="p-8 md:p-12 flex flex-col justify-center">
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    <span className="font-bold text-primary">{posts[0].category}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1.5"><Clock size={14} /> {posts[0].readTime}</span>
                  </div>
                  <h2 className="font-display text-3xl font-bold text-gray-900 mb-4 group-hover:text-primary transition-colors">
                    {posts[0].title}
                  </h2>
                  <p className="text-gray-600 mb-8 leading-relaxed line-clamp-3">
                    {posts[0].excerpt}
                  </p>
                  <div className="mt-auto flex items-center gap-2 text-primary font-bold">
                    Lire l'article <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Grid Posts */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.slice(1).map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`} className="group block bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col">
              <div className="relative h-56 w-full overflow-hidden">
                <Image 
                  src={post.imageUrl} 
                  alt={post.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-gray-900 text-xs font-bold rounded-full shadow-sm">
                    {post.category}
                  </span>
                </div>
              </div>
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center gap-4 text-xs text-gray-500 font-medium mb-3">
                  <span>{post.date}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5"><Clock size={14} /> {post.readTime}</span>
                </div>
                <h3 className="font-display text-xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-sm text-gray-600 mb-6 line-clamp-3">
                  {post.excerpt}
                </p>
                <div className="mt-auto flex items-center gap-2 text-gray-900 font-bold text-sm">
                  Lire la suite <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </div>
  )
}
