import { SetMetadata } from '@nestjs/common'

export const AUDIT_KEY = 'audit:action'

export interface AuditMeta {
  action: string      // ex. 'product.update'
  targetType?: string // ex. 'product'
}

/** Inscrit l'appel réussi de la route dans le journal des actions (corps de requête sans secrets). */
export const Audit = (action: string, targetType?: string) => SetMetadata(AUDIT_KEY, { action, targetType } as AuditMeta)
