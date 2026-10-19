import { api } from './index'

// ── Rôles du back-office (contrat : yopoeprint-api/src/modules/users/user.entity.ts) ──
export type Role = 'superadmin' | 'admin' | 'staff'

export const ROLE_LABELS: Record<string, string> = {
  superadmin: 'Super administrateur',
  admin: 'Administrateur',
  staff: 'Atelier',
  client: 'Client',
}

export const ROLE_HINTS: Record<Role, string> = {
  superadmin: 'Tout, plus l\'équipe, les paramètres et le journal',
  admin: 'Catalogue, clients, revendeurs, commandes et devis',
  staff: 'Commandes, BAT et devis (lecture seule ailleurs)',
}

// ── Paramètres de la plateforme (yopoeprint-api/src/modules/settings) ──
export interface DeliveryZone {
  id: string
  label: string
  city: string
  price: number
  delay: string
  enabled: boolean
  freeEligible: boolean
}

export interface ResellerTier {
  id: string
  label: string
  rate: number
  minRevenue: number
}

export interface PlatformSettings {
  contact: { phone: string; whatsapp: string; email: string; address: string }
  delivery: { freeThreshold: number; zones: DeliveryZone[] }
  resellerTiers: ResellerTier[]
  maintenance: { enabled: boolean; message: string }
  // Mentions des devis PDF (raison sociale, RCCM, IFU)
  legal: { companyName: string; rccm: string; ifu: string }
}

export interface SettingsResponse {
  settings: PlatformSettings
  updatedAt: string | null
  updatedBy: string | null
}

// ── Équipe ──
export interface TeamMember {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string | null
  role: Role | 'client'
  isActive: boolean
  createdAt: string
}

// ── Journal ──
export interface AuditEntry {
  id: string
  actorId: string | null
  actorEmail: string | null
  actorRole: string | null
  action: string
  targetType: string | null
  targetId: string | null
  details: Record<string, unknown> | null
  ip: string | null
  createdAt: string
}

export const platformService = {
  getSettings: (): Promise<SettingsResponse> => api.get('/admin/settings'),
  saveSettings: (settings: PlatformSettings): Promise<SettingsResponse> => api.put('/admin/settings', settings),

  listTeam: (): Promise<TeamMember[]> => api.get('/admin/team'),
  createMember: (data: { firstName: string; lastName: string; email: string; phone?: string; password: string; role: Role }): Promise<TeamMember> =>
    api.post('/admin/team', data),
  setRole: (id: string, role: Role | 'client'): Promise<TeamMember> => api.patch(`/admin/team/${id}/role`, { role }),
  setActive: (id: string, isActive: boolean): Promise<TeamMember> => api.patch(`/admin/team/${id}/active`, { isActive }),

  auditLogs: (query: { action?: string; page?: number; limit?: number } = {}): Promise<{ data: AuditEntry[]; total: number; page: number; limit: number; hasMore: boolean }> => {
    const p = new URLSearchParams()
    if (query.action) p.set('action', query.action)
    p.set('page', String(query.page || 1))
    p.set('limit', String(query.limit || 50))
    return api.get(`/admin/audit-logs?${p}`)
  },
}
