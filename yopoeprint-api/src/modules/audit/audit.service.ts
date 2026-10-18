import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { AuditLog } from './audit-log.entity'
import { AuditQueryDto } from './audit.dto'

const SECRET_KEY = /pass(word)?|token|secret|signature|hash/i
const MAX_STRING = 500

// Copie du corps de requête sans secrets, chaînes tronquées, profondeur limitée
export function sanitize(value: unknown, depth = 0): unknown {
  if (value === null || value === undefined) return value
  if (typeof value === 'string') return value.length > MAX_STRING ? value.slice(0, MAX_STRING) + '…' : value
  if (typeof value !== 'object') return value
  if (depth > 4) return '[…]'
  if (Array.isArray(value)) return value.slice(0, 50).map((v) => sanitize(v, depth + 1))
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    out[k] = SECRET_KEY.test(k) ? '[masqué]' : sanitize(v, depth + 1)
  }
  return out
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name)

  constructor(
    @InjectRepository(AuditLog)
    private repo: Repository<AuditLog>,
  ) {}

  async record(entry: {
    actor?: { id?: string; email?: string; role?: string } | null
    action: string
    targetType?: string | null
    targetId?: string | null
    details?: unknown
    ip?: string | null
  }) {
    try {
      await this.repo.insert({
        actorId: entry.actor?.id ?? null,
        actorEmail: entry.actor?.email ?? null,
        actorRole: entry.actor?.role ?? null,
        action: entry.action,
        targetType: entry.targetType ?? null,
        targetId: entry.targetId ? String(entry.targetId).slice(0, 64) : null,
        details: (sanitize(entry.details) as Record<string, unknown>) ?? null,
        ip: entry.ip ? String(entry.ip).slice(0, 64) : null,
      })
    } catch (err: any) {
      // Le journal ne doit jamais faire échouer l'action elle-même
      this.logger.error(`Journal d'audit non écrit (${entry.action}) : ${err?.message || err}`)
    }
  }

  async list(query: AuditQueryDto) {
    const page = Math.max(parseInt(query.page || '1', 10) || 1, 1)
    const limit = Math.min(Math.max(parseInt(query.limit || '50', 10) || 50, 1), 200)
    const qb = this.repo.createQueryBuilder('a')
      .orderBy('a.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
    if (query.action) qb.andWhere('a.action LIKE :action', { action: `${query.action.replace(/[%_\\]/g, '')}%` })
    if (query.actorId) qb.andWhere('a.actor_id = :actorId', { actorId: query.actorId })
    if (query.targetId) qb.andWhere('a.target_id = :targetId', { targetId: query.targetId })
    const [data, total] = await qb.getManyAndCount()
    return { data, total, page, limit, hasMore: (page - 1) * limit + data.length < total }
  }
}
