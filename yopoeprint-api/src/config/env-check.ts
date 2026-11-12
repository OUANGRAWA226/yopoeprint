import { Logger } from '@nestjs/common'

// Sans elles, l'API ne peut pas fonctionner (ou serait dangereuse) : démarrage refusé
const REQUIRED = ['DB_HOST', 'DB_PASSWORD', 'JWT_SECRET', 'JWT_REFRESH_SECRET'] as const

// Sans elles, une fonction de la boutique tombe en panne sans bruit : signalées à chaque démarrage
const LAUNCH = [
  ['FRONTEND_URL',          'CORS, liens des emails et retour de paiement pointent vers localhost'],
  ['ADMIN_URL',             'le back-office est refusé par CORS'],
  ['BACKEND_URL',           'notify_url CinetPay = localhost : aucune confirmation de paiement'],
  ['CINETPAY_API_KEY',      'paiement en ligne impossible'],
  ['CINETPAY_SITE_ID',      'paiement en ligne impossible'],
  ['CINETPAY_SECRET_KEY',   'signature du webhook CinetPay non vérifiée'],
  ['RESEND_API_KEY',        'emails simulés : aucun email réellement envoyé'],
  ['GOOGLE_CLIENT_ID',      '« Continuer avec Google » renvoie une erreur'],
  ['CLOUDINARY_API_KEY',    'envoi de fichiers impossible'],
  ['CLOUDINARY_API_SECRET', 'envoi de fichiers impossible'],
] as const

const isSet = (name: string) => !!process.env[name]?.trim()

/** Vérifie la configuration de production. Lève une erreur si une variable indispensable manque. */
export function checkProductionEnv(logger = new Logger('Config')) {
  const missing = REQUIRED.filter((name) => !isSet(name))
  if (missing.length) {
    throw new Error(`Variables d'environnement manquantes : ${missing.join(', ')}`)
  }
  for (const name of ['JWT_SECRET', 'JWT_REFRESH_SECRET']) {
    if (process.env[name].length < 32) throw new Error(`${name} trop court (32 caractères minimum)`)
  }
  if (process.env.JWT_SECRET === process.env.JWT_REFRESH_SECRET) {
    throw new Error('JWT_SECRET et JWT_REFRESH_SECRET doivent être différents')
  }

  for (const [name, impact] of LAUNCH) {
    if (!isSet(name)) logger.error(`${name} non définie : ${impact}`)
  }
  if (!isSet('ADMIN_SETUP_TOKEN')) {
    logger.warn('ADMIN_SETUP_TOKEN non définie : création du premier administrateur fermée')
  }
}
