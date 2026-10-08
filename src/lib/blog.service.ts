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

import { api } from './api'

export const MOCK_BLOG_POSTS: BlogPost[] = [
  {
    id: '1',
    slug: 'quel-grammage-papier-choisir',
    title: 'Quel grammage de papier choisir pour vos impressions ?',
    excerpt: 'Cartes de visite, flyers, affiches... Le choix du grammage est crucial pour le rendu final. Découvrez notre guide complet pour ne plus jamais vous tromper.',
    content: `
      <h2>Pourquoi le grammage est-il important ?</h2>
      <p>Le grammage correspond au poids du papier au mètre carré (ex: 135g/m²). Plus le chiffre est élevé, plus le papier est épais et rigide. Un mauvais choix peut donner un aspect "cheap" à votre communication ou, au contraire, vous coûter trop cher pour une distribution de masse.</p>
      
      <h2>1. Les Flyers et Dépliants (115g à 170g)</h2>
      <p>Pour la distribution en rue (street marketing), un grammage léger comme le <strong>135g Couché Brillant</strong> est le standard absolu. Il est léger à transporter, économique, et offre un excellent rendu des couleurs.</p>
      <p>Si vous laissez vos dépliants sur un présentoir (hôtels, salons), optez plutôt pour du <strong>170g</strong> pour éviter qu'ils ne se courbent.</p>

      <h2>2. Les Cartes de Visite (300g à 400g)</h2>
      <p>La carte de visite est le reflet de votre entreprise. Ne descendez <strong>jamais en dessous de 300g</strong>. Chez YopoePrint, nous recommandons le 350g avec un pelliculage mat pour un rendu professionnel et une tenue parfaite dans le temps.</p>

      <h2>3. Les Affiches (135g à 250g)</h2>
      <p>Pour une affiche qui sera collée au mur en intérieur, le 135g est suffisant. En revanche, pour une affiche encadrée ou suspendue, préférez un 250g qui ne gondolera pas avec l'humidité.</p>
      
      <blockquote>"Le papier n'est pas qu'un support, c'est la première impression tactile que vous laissez à votre client."</blockquote>
    `,
    category: 'Conseils pratiques',
    author: 'L\'équipe YopoePrint',
    date: '25 Mai 2026',
    readTime: '3 min',
    imageUrl: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?q=80&w=1000&auto=format&fit=crop'
  },
  {
    id: '2',
    slug: 'preparer-fichier-pdf-impression',
    title: 'Comment bien préparer son fichier PDF pour l\'impression',
    excerpt: 'Fonds perdus, marge de sécurité, colorimétrie CMJN... Évitez les mauvaises surprises à l\'impression grâce à notre checklist technique.',
    content: `
      <h2>Les 3 règles d'or de l'impression</h2>
      <p>Rien n'est plus frustrant que de recevoir une impression avec des bords blancs inattendus ou des couleurs ternes. Voici comment préparer votre fichier comme un pro.</p>
      
      <h2>1. Les Fonds Perdus (Bleed)</h2>
      <p>Les machines de coupe ont toujours une petite marge d'erreur (environ 1 à 2 mm). Si votre fond est coloré, vous devez faire déborder la couleur de <strong>3 mm</strong> en dehors de la zone finale. C'est ce qu'on appelle les fonds perdus.</p>

      <h2>2. Le mode colorimétrique : CMJN obligatoire</h2>
      <p>Votre écran affiche des couleurs en <strong>RVB</strong> (Rouge, Vert, Bleu) en utilisant de la lumière. L'imprimante, elle, utilise de l'encre en <strong>CMJN</strong> (Cyan, Magenta, Jaune, Noir). Si vous envoyez un fichier RVB, l'imprimante le convertira automatiquement, et vos couleurs "fluo" deviendront ternes. Travaillez toujours en CMJN depuis Illustrator ou Canva Pro !</p>

      <h2>3. La haute résolution (300 DPI)</h2>
      <p>Les images de votre site web sont en 72 DPI (résolution écran). Pour l'impression, l'image doit être au minimum en <strong>300 DPI</strong>. En dessous, l'impression sera floue et pixelisée.</p>
    `,
    category: 'Tutoriel',
    author: 'L\'équipe YopoePrint',
    date: '20 Mai 2026',
    readTime: '4 min',
    imageUrl: 'https://images.unsplash.com/photo-1626786136128-48b2691eb299?q=80&w=1000&auto=format&fit=crop'
  },
  {
    id: '3',
    slug: 'tendances-design-imprimerie-2026',
    title: 'Les 5 tendances de design en imprimerie pour 2026',
    excerpt: 'Du minimalisme texturé au vernis sélectif, découvrez ce qui fait la différence aujourd\'hui pour marquer les esprits.',
    content: `
      <h2>1. Le retour aux textures brutes</h2>
      <p>L'aspect lisse et plastifié perd du terrain face aux papiers texturés (grain feutre, papier recyclé). Les marques cherchent à transmettre l'authenticité.</p>
      
      <h2>2. Le vernis sélectif 3D</h2>
      <p>Un vernis brillant qui vient en surépaisseur sur votre logo ou vos textes importants. L'effet "waouh" au toucher est garanti.</p>

      <h2>3. Le minimalisme ultra-coloré</h2>
      <p>Fini les cartes de visite surchargées d'informations. La tendance est à l'espace vide, avec une couleur de fond très forte et un texte imposant.</p>
    `,
    category: 'Inspiration',
    author: 'L\'équipe YopoePrint',
    date: '15 Mai 2026',
    readTime: '2 min',
    imageUrl: 'https://images.unsplash.com/photo-1558655146-d09347e92766?q=80&w=1000&auto=format&fit=crop'
  }
]

export const getBlogPosts = async (): Promise<BlogPost[]> => {
  try {
    const data = await api.get('/posts')
    return Array.isArray(data) ? data : data?.data || MOCK_BLOG_POSTS
  } catch (err) {
    console.error('Failed to fetch blog posts', err)
    return MOCK_BLOG_POSTS // fallback au cas où
  }
}

export const getBlogPostBySlug = async (slug: string): Promise<BlogPost | null> => {
  try {
    const data = await api.get(`/posts/slug/${slug}`)
    return data || null
  } catch (err) {
    console.error(`Failed to fetch blog post ${slug}`, err)
    return MOCK_BLOG_POSTS.find(p => p.slug === slug) || null
  }
}
