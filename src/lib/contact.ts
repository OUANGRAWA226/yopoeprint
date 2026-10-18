// Coordonnées de l'atelier, utilisées partout sur le site (téléphone, WhatsApp, données structurées).
// Renseigner NEXT_PUBLIC_CONTACT_PHONE (format international, ex. +22670123456) dans l'environnement :
// la valeur par défaut est un numéro d'exemple, pas le vrai numéro de l'atelier.

const RAW_PHONE = process.env.NEXT_PUBLIC_CONTACT_PHONE || '+22670000000'

/** Numéro au format international sans espaces, pour tel: et les données structurées */
export const CONTACT_PHONE = RAW_PHONE.replace(/[^\d+]/g, '')

/** Numéro lisible : +226 70 12 34 56 */
export const CONTACT_PHONE_DISPLAY = CONTACT_PHONE.startsWith('+226') && CONTACT_PHONE.length === 12
  ? `+226 ${CONTACT_PHONE.slice(4).replace(/(\d{2})(?=\d)/g, '$1 ')}`
  : CONTACT_PHONE

/** Lien WhatsApp (wa.me attend le numéro sans « + ») ; ajouter `?text=...` si besoin */
export const WHATSAPP_URL = `https://wa.me/${CONTACT_PHONE.replace('+', '')}`
