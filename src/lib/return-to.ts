'use client'

// Page où se trouvait le client avant d'aller se connecter ou créer son compte :
// on l'y ramène ensuite, comme sur les grandes boutiques en ligne.
const KEY = 'yp_return_to'

// Pages d'où l'on ne revient pas (connexion, inscription, mot de passe)
const AUTH_PAGES = ['/connexion', '/inscription', '/mot-de-passe-oublie', '/reinitialiser-mot-de-passe']

const isAuthPage = (path: string) => AUTH_PAGES.some((p) => path === p || path.startsWith(p + '/') || path.startsWith(p + '?'))

// Seulement un chemin du site : jamais « //autre-site » ni « https://… »
const isSafe = (path: string | null | undefined): path is string =>
  !!path && path.startsWith('/') && !path.startsWith('//') && !path.startsWith('/\\') && !isAuthPage(path)

/** Mémorise la page affichée (appelé à chaque changement de page). */
export function rememberPage(path: string) {
  if (!isSafe(path)) return
  try { sessionStorage.setItem(KEY, path) } catch {}
}

/**
 * Où aller après la connexion ou l'inscription : le paramètre `redirect` s'il est sûr
 * (ex. retour au paiement), sinon la dernière page visitée, sinon `fallback`.
 */
export function returnPath(redirectParam: string | null, fallback: string): string {
  if (isSafe(redirectParam)) return redirectParam
  try {
    const saved = sessionStorage.getItem(KEY)
    if (isSafe(saved)) return saved
  } catch {}
  return fallback
}
