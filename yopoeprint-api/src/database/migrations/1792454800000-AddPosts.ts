import { MigrationInterface, QueryRunner } from 'typeorm'

// Blog géré depuis l'admin. Les 3 articles jusqu'ici codés en dur dans la boutique (src/lib/blog.service.ts)
// sont repris en Markdown, publiés à leurs dates d'origine, pour que le blog reste identique au déploiement.
const SEED = [
  {
    slug: 'quel-grammage-papier-choisir',
    title: 'Quel grammage de papier choisir pour vos impressions ?',
    excerpt: 'Cartes de visite, flyers, affiches... Le choix du grammage est crucial pour le rendu final. Découvrez notre guide complet pour ne plus jamais vous tromper.',
    category: 'Conseils pratiques',
    cover: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?q=80&w=1000&auto=format&fit=crop',
    date: '2026-05-25T08:00:00Z',
    content: `## Pourquoi le grammage est-il important ?

Le grammage correspond au poids du papier au mètre carré (ex : 135 g/m²). Plus le chiffre est élevé, plus le papier est épais et rigide. Un mauvais choix peut donner un aspect « cheap » à votre communication ou, au contraire, vous coûter trop cher pour une distribution de masse.

## 1. Les flyers et dépliants (115 g à 170 g)

Pour la distribution en rue (street marketing), un grammage léger comme le **135 g couché brillant** est le standard absolu. Il est léger à transporter, économique, et offre un excellent rendu des couleurs.

Si vous laissez vos dépliants sur un présentoir (hôtels, salons), optez plutôt pour du **170 g** pour éviter qu'ils ne se courbent.

## 2. Les cartes de visite (300 g à 400 g)

La carte de visite est le reflet de votre entreprise. Ne descendez **jamais en dessous de 300 g**. Chez YopoePrint, nous recommandons le 350 g avec un pelliculage mat pour un rendu professionnel et une tenue parfaite dans le temps.

## 3. Les affiches (135 g à 250 g)

Pour une affiche qui sera collée au mur en intérieur, le 135 g est suffisant. En revanche, pour une affiche encadrée ou suspendue, préférez un 250 g qui ne gondolera pas avec l'humidité.

> « Le papier n'est pas qu'un support, c'est la première impression tactile que vous laissez à votre client. »`,
  },
  {
    slug: 'preparer-fichier-pdf-impression',
    title: 'Comment bien préparer son fichier PDF pour l\'impression',
    excerpt: 'Fonds perdus, marge de sécurité, colorimétrie CMJN... Évitez les mauvaises surprises à l\'impression grâce à notre checklist technique.',
    category: 'Tutoriel',
    // L'ancienne photo Unsplash n'existe plus (404) : visuel par défaut de la boutique en attendant une couverture
    cover: null,
    date: '2026-05-20T08:00:00Z',
    content: `## Les 3 règles d'or de l'impression

Rien n'est plus frustrant que de recevoir une impression avec des bords blancs inattendus ou des couleurs ternes. Voici comment préparer votre fichier comme un pro.

## 1. Les fonds perdus (bleed)

Les machines de coupe ont toujours une petite marge d'erreur (environ 1 à 2 mm). Si votre fond est coloré, vous devez faire déborder la couleur de **3 mm** en dehors de la zone finale. C'est ce qu'on appelle les fonds perdus.

## 2. Le mode colorimétrique : CMJN obligatoire

Votre écran affiche des couleurs en **RVB** (rouge, vert, bleu) en utilisant de la lumière. L'imprimante, elle, utilise de l'encre en **CMJN** (cyan, magenta, jaune, noir). Si vous envoyez un fichier RVB, l'imprimante le convertira automatiquement, et vos couleurs « fluo » deviendront ternes. Travaillez toujours en CMJN depuis Illustrator ou Canva Pro !

## 3. La haute résolution (300 DPI)

Les images de votre site web sont en 72 DPI (résolution écran). Pour l'impression, l'image doit être au minimum en **300 DPI**. En dessous, l'impression sera floue et pixelisée.`,
  },
  {
    slug: 'tendances-design-imprimerie-2026',
    title: 'Les 5 tendances de design en imprimerie pour 2026',
    excerpt: 'Du minimalisme texturé au vernis sélectif, découvrez ce qui fait la différence aujourd\'hui pour marquer les esprits.',
    category: 'Inspiration',
    cover: 'https://images.unsplash.com/photo-1558655146-d09347e92766?q=80&w=1000&auto=format&fit=crop',
    date: '2026-05-15T08:00:00Z',
    content: `## 1. Le retour aux textures brutes

L'aspect lisse et plastifié perd du terrain face aux papiers texturés (grain feutre, papier recyclé). Les marques cherchent à transmettre l'authenticité.

## 2. Le vernis sélectif 3D

Un vernis brillant qui vient en surépaisseur sur votre logo ou vos textes importants. L'effet « waouh » au toucher est garanti.

## 3. Le minimalisme ultra-coloré

Fini les cartes de visite surchargées d'informations. La tendance est à l'espace vide, avec une couleur de fond très forte et un texte imposant.`,
  },
]

export class AddPosts1792454800000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "posts" (
        "id"            uuid          NOT NULL DEFAULT gen_random_uuid(),
        "slug"          varchar(120)  NOT NULL,
        "title"         varchar(160)  NOT NULL,
        "excerpt"       varchar(300)  NOT NULL,
        "content"       text          NOT NULL,
        "category"      varchar(60)   NOT NULL,
        "author_name"   varchar(80)   NOT NULL DEFAULT 'L''équipe YopoePrint',
        "cover_url"     text          NULL,
        "is_published"  boolean       NOT NULL DEFAULT false,
        "published_at"  timestamptz   NULL,
        "created_at"    timestamp     NOT NULL DEFAULT now(),
        "updated_at"    timestamp     NOT NULL DEFAULT now(),
        CONSTRAINT "PK_posts_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_posts_slug" UNIQUE ("slug")
      )
    `)
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_posts_is_published" ON "posts" ("is_published")`)
    for (const p of SEED) {
      await queryRunner.query(
        `INSERT INTO "posts" ("slug", "title", "excerpt", "content", "category", "cover_url", "is_published", "published_at")
         VALUES ($1, $2, $3, $4, $5, $6, true, $7) ON CONFLICT ("slug") DO NOTHING`,
        [p.slug, p.title, p.excerpt, p.content, p.category, p.cover, p.date],
      )
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "posts"`)
  }
}
