'use client'

import { useEffect, useState } from 'react'
import { api } from './api'

// Contrat de l'API : GET /settings/public (yopoeprint-api/src/modules/settings)
export interface DeliveryZone {
  id: string
  label: string
  city: string
  price: number
  delay: string
  enabled: boolean
  freeEligible: boolean
}

export interface PublicTier {
  id: string
  label: string
  rate: number
  minRevenue: number
}

export interface PublicSettings {
  contact: { phone: string; whatsapp: string; email: string; address: string }
  delivery: { freeThreshold: number; zones: DeliveryZone[] }
  resellerTiers: PublicTier[]
  maintenance: { enabled: boolean; message: string }
}

// Une seule requête partagée par toutes les pages de la session
let pending: Promise<PublicSettings> | null = null

export function fetchPublicSettings(): Promise<PublicSettings> {
  if (!pending) {
    pending = api.get<PublicSettings>('/settings/public').catch((e) => {
      pending = null
      throw e
    })
  }
  return pending
}

/** Paramètres publics de la plateforme ; `null` pendant le chargement ou si l'API est injoignable. */
export function usePublicSettings() {
  const [settings, setSettings] = useState<PublicSettings | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let alive = true
    fetchPublicSettings()
      .then((s) => { if (alive) setSettings(s) })
      .catch(() => { if (alive) setError(true) })
    return () => { alive = false }
  }, [])

  return { settings, error }
}
