import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getBlogPostBySlug } from '@/lib/blog.service'
import { ArrowLeft, Clock, Calendar, ShoppingBag } from 'lucide-react'

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props) {
  const post = await getBlogPostBySlug(params.slug)
  if (!post) return { title: 'Article introuvable' }

  return {
    title: `${post.title} — Blog YopoePrint`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      images: [post.imageUrl],
    }
  }
}

export default async function BlogPostPage({ params }: Props) {
  const post = await getBlogPostBySlug(params.slug)

  if (!post) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-white">
      
      {/* ─── HEADER ARTICLE ─── */}
      <div className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image 
            src={post.imageUrl}
            alt={post.title}
            fill
            className="object-cover opacity-10"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white to-white" />
        </div>
        
        <div className="relative z-10 max-w-3xl mx-auto px-4 md:px-6 text-center">
          <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors mb-8">
            <ArrowLeft size={16} /> Retour au blog
          </Link>
          
          <div className="flex items-center justify-center gap-3 text-sm text-primary font-bold mb-6">
            <span className="px-3 py-1 bg-primary/10 rounded-full">{post.category}</span>
          </div>

          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-8">
            {post.title}
          </h1>

          <div className="flex items-center justify-center gap-6 text-sm text-gray-500 font-medium">
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              {post.date}
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} />
              {post.readTime}
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-gray-300"></span>
              Par {post.author}
            </div>
          </div>
        </div>
      </div>

      {/* ─── MAIN IMAGE ─── */}
      <div className="max-w-5xl mx-auto px-4 md:px-6 -mt-12 relative z-20 mb-16">
        <div className="aspect-[21/9] relative rounded-2xl overflow-hidden shadow-2xl">
          <Image 
            src={post.imageUrl}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>

      {/* ─── CONTENT ─── */}
      <article className="max-w-3xl mx-auto px-4 md:px-6 pb-20">
        
        {/* Prose Content */}
        {/* Note: We use a custom styled div to render HTML securely (in a real app, sanitize it) */}
        <div 
          className="prose prose-lg prose-gray max-w-none 
                     prose-headings:font-display prose-headings:font-bold prose-headings:text-gray-900
                     prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6
                     prose-p:text-gray-600 prose-p:leading-relaxed prose-p:mb-6
                     prose-strong:text-gray-900
                     prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-gray-50 prose-blockquote:p-6 prose-blockquote:rounded-r-xl prose-blockquote:text-gray-900 prose-blockquote:font-medium prose-blockquote:italic"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* ─── CALL TO ACTION (Bottom of Article) ─── */}
        <div className="mt-20 p-8 md:p-12 bg-gray-900 rounded-3xl text-center relative overflow-hidden">
          {/* Decorative background */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 max-w-xl mx-auto">
            <h3 className="font-display text-3xl font-extrabold text-white mb-4">
              Prêt à imprimer vos créations ?
            </h3>
            <p className="text-gray-400 mb-8 leading-relaxed">
              Maintenant que vous avez toutes les clés en main, découvrez notre catalogue de produits d'impression premium. Livraison rapide partout au Burkina Faso.
            </p>
            <Link 
              href="/catalogue"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-gray-900 px-8 py-4 rounded-xl font-bold transition-all hover:scale-105 shadow-xl shadow-primary/20"
            >
              <ShoppingBag size={20} />
              Découvrir le catalogue
            </Link>
          </div>
        </div>

      </article>
    </div>
  )
}
