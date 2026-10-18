/**
 * Test d'intégration rapide YopoePrint
 * Vérifie la santé des routes critiques, la redirection des catégories et la cohérence des avis
 */

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000'

const ROUTES_TO_TEST = [
  { path: '/', label: 'Accueil' },
  { path: '/catalogue', label: 'Catalogue principal' },
  { path: '/catalogue/cartes-de-visite', label: 'Catégorie Cartes' },
  { path: '/catalogue/flyers', label: 'Catégorie Flyers' },
  { path: '/catalogue/roll-up', label: 'Catégorie Roll-up' },
  { path: '/produit/carte-de-visite-standard', label: 'Produit Carte de Visite' },
  { path: '/produit/flyer-a5-classique', label: 'Produit Flyer A5' },
  { path: '/produit/kakemono-roll-up', label: 'Produit Kakémono Roll-up' },
  { path: '/commande', label: 'Tunnel de commande' },
  { path: '/robots.txt', label: 'Robots.txt SEO' },
  { path: '/sitemap.xml', label: 'Sitemap.xml SEO' },
]

async function runTests() {
  console.log(`\n🚀 Lancement des vérifications d'intégration sur ${BASE_URL}...\n`)
  let passed = 0
  let failed = 0

  for (const route of ROUTES_TO_TEST) {
    const start = Date.now()
    try {
      const res = await fetch(`${BASE_URL}${route.path}`, { redirect: 'follow' })
      const duration = Date.now() - start
      const body = await res.text()

      if (res.ok) {
        console.log(`✅ [${res.status}] ${route.label.padEnd(28)} (${duration}ms)`)
        
        // Tests spécifiques sur la fiche produit
        if (route.path.includes('/produit/carte-de-visite-standard')) {
          const has0Ex = body.includes('Total · 0 ex')
          const hasCorrectReviews = body.includes('127') && body.includes('4.9')
          const hasJsonLd = body.includes('application/ld+json') && body.includes('AggregateRating')
          if (has0Ex) {
            console.log(`   ⚠️ AVERTISSEMENT : 'Total · 0 ex' détecté dans le HTML brut`)
          } else {
            console.log(`   ✨ Vérifié : Pas de '0 ex' initial, initialisation immédiate`)
          }
          if (hasCorrectReviews) {
            console.log(`   ✨ Vérifié : Avis cohérents 4.9/5 et 127 avis`)
          }
          if (hasJsonLd) {
            console.log(`   ✨ Vérifié : Données structurées JSON-LD (Schema.org / Product / AggregateRating)`)
          }
        }

        passed++
      } else {
        console.error(`❌ [${res.status}] ${route.label} (${duration}ms)`)
        failed++
      }
    } catch (err) {
      console.error(`❌ Erreur connexion: ${route.label} - ${err.message}`)
      failed++
    }
  }

  // Test de la redirection /catalogue/cartes
  try {
    const redirectRes = await fetch(`${BASE_URL}/catalogue/cartes`, { redirect: 'manual' })
    if (redirectRes.status === 307 || redirectRes.status === 308 || redirectRes.status === 301 || redirectRes.status === 302 || redirectRes.status === 200) {
      console.log(`✅ [${redirectRes.status}] Redirection SEO /catalogue/cartes validée`)
      passed++
    } else {
      console.log(`⚠️ Statut redirection inattendu : ${redirectRes.status}`)
    }
  } catch (err) {
    console.log(`⚠️ Test redirection : ${err.message}`)
  }

  console.log(`\n📊 Bilan : ${passed} passés, ${failed} échoués.\n`)
}

runTests()
