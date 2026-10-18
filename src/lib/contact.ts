// Coordonnées de l'atelier : lues dans les paramètres de la plateforme (admin › Paramètres › Coordonnées).
// NEXT_PUBLIC_CONTACT_PHONE ne sert plus que de valeur de secours si l'API ne répond pas.
// Pages client : useContact() (src/lib/settings.service.ts). Pages serveur : await getServerContact().

export interface ContactSettings {
  phone: string
  whatsapp: string
  email: string
  address: string
}

export interface ContactInfo {
  /** Numéro au format international sans espaces, pour tel: et les données structurées */
  phone: string
  /** Numéro lisible : +226 70 12 34 56 */
  phoneDisplay: string
  /** Lien WhatsApp (wa.me attend le numéro sans « + ») ; ajouter `?text=...` si besoin */
  whatsappUrl: string
  email: string
  address: string
}

const FALLBACK: ContactSettings = {
  phone: process.env.NEXT_PUBLIC_CONTACT_PHONE || '+22670000000',
  whatsapp: process.env.NEXT_PUBLIC_CONTACT_PHONE || '+22670000000',
  email: 'contact@yopoeprint.bf',
  address: 'Ouagadougou, Burkina Faso',
}

const clean = (raw: string) => raw.replace(/[^\d+]/g, '')

export function formatPhone(raw: string): string {
  const phone = clean(raw)
  return phone.startsWith('+226') && phone.length === 12
    ? `+226 ${phone.slice(4).replace(/(\d{2})(?=\d)/g, '$1 ')}`
    : phone
}

export function toContactInfo(settings?: Partial<ContactSettings> | null): ContactInfo {
  const s = { ...FALLBACK, ...Object.fromEntries(Object.entries(settings || {}).filter(([, v]) => v)) }
  return {
    phone: clean(s.phone),
    phoneDisplay: formatPhone(s.phone),
    whatsappUrl: `https://wa.me/${clean(s.whatsapp).replace('+', '')}`,
    email: s.email,
    address: s.address,
  }
}

/** Coordonnées de secours (avant le chargement des paramètres ou si l'API est injoignable). */
export const DEFAULT_CONTACT = toContactInfo()

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'

/** Pages serveur : coordonnées des paramètres, mises en cache 5 minutes. */
export async function getServerContact(): Promise<ContactInfo> {
  try {
    const res = await fetch(`${API_URL}/settings/public`, { next: { revalidate: 300 } })
    if (!res.ok) return DEFAULT_CONTACT
    const data = await res.json()
    return toContactInfo(data?.contact)
  } catch {
    return DEFAULT_CONTACT
  }
}
