import { Raw } from 'typeorm'

// Identifiants des comptes : une même adresse ou un même numéro, quelle que soit la façon de le saisir.

/** « Awa@Gmail.com  » → « awa@gmail.com » (claviers de téléphone qui ajoutent une majuscule). */
export const normalizeEmail = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim().toLowerCase() : value

/** « +226 70.12-34 56 » → « +22670123456 » ; chaîne vide → null. */
export const normalizePhone = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? (value.replace(/[\s.\-()]/g, '') || null) : value

/**
 * Recherche d'email insensible à la casse : les comptes créés avant la normalisation
 * peuvent contenir des majuscules en base.
 */
export const emailEquals = (email: string) =>
  Raw((alias) => `LOWER(${alias}) = :normalizedEmail`, { normalizedEmail: email.trim().toLowerCase() })

/** Recherche de téléphone sans tenir compte des espaces, points ou tirets enregistrés. */
export const phoneEquals = (phone: string) =>
  Raw((alias) => `regexp_replace(${alias}, '[^0-9+]', '', 'g') = :normalizedPhone`, {
    normalizedPhone: phone.replace(/[^0-9+]/g, ''),
  })
