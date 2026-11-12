import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { LessThan, MoreThan, Not, Repository } from 'typeorm'
import { createHash, timingSafeEqual } from 'crypto'
import { UserSession } from './user-session.entity'

const hash = (token: string) => createHash('sha256').update(token).digest('hex')

const sameHash = (a: string | null | undefined, b: string) => {
  if (!a) return false
  const x = Buffer.from(a, 'utf8')
  const y = Buffer.from(b, 'utf8')
  return x.length === y.length && timingSafeEqual(x, y)
}

// Délai pendant lequel le jeton tout juste remplacé reste accepté (onglets simultanés, réseau lent)
const ROTATION_GRACE_MS = 30_000

export type VerifyResult = 'ok' | 'unknown' | 'reused'

@Injectable()
export class SessionsService {
  constructor(@InjectRepository(UserSession) private sessions: Repository<UserSession>) {}

  /** Ouvre une session vide ; son jeton est enregistré par setToken une fois signé (il contient l'id). */
  async open(userId: string, ttlMs: number): Promise<UserSession> {
    // Ménage : les sessions expirées de ce compte n'ont plus d'usage
    await this.sessions.delete({ userId, expiresAt: LessThan(new Date()) })
    const now = new Date()
    return this.sessions.save(this.sessions.create({
      userId, tokenHash: '', lastUsedAt: now, expiresAt: new Date(now.getTime() + ttlMs),
    }))
  }

  /** Enregistre le nouveau jeton de la session ; l'ancien reste valable ROTATION_GRACE_MS. */
  async setToken(sessionId: string, refreshToken: string, ttlMs: number) {
    const session = await this.sessions.findOne({ where: { id: sessionId } })
    if (!session) return
    const now = new Date()
    await this.sessions.update(sessionId, {
      previousTokenHash: session.tokenHash || null,
      rotatedAt: session.tokenHash ? now : null,
      tokenHash: hash(refreshToken),
      lastUsedAt: now,
      expiresAt: new Date(now.getTime() + ttlMs),
    })
  }

  /**
   * Vérifie le jeton de renouvellement présenté pour cette session.
   * Le jeton courant, ou celui qu'il vient de remplacer (délai de grâce), est accepté.
   * Un jeton plus ancien qui revient signifie qu'il a été copié : la session est fermée,
   * le voleur comme le titulaire devront se reconnecter.
   */
  async verify(sessionId: string, userId: string, refreshToken: string): Promise<VerifyResult> {
    const session = await this.sessions.findOne({ where: { id: sessionId, userId, expiresAt: MoreThan(new Date()) } })
    if (!session) return 'unknown'
    const presented = hash(refreshToken)
    if (sameHash(session.tokenHash, presented)) return 'ok'
    const inGrace = session.rotatedAt && Date.now() - session.rotatedAt.getTime() < ROTATION_GRACE_MS
    if (inGrace && sameHash(session.previousTokenHash, presented)) return 'ok'
    await this.sessions.delete(session.id)
    return 'reused'
  }

  /** Session encore ouverte ? (contrôlé à chaque requête authentifiée) */
  async isOpen(sessionId: string, userId: string): Promise<boolean> {
    return (await this.sessions.count({ where: { id: sessionId, userId, expiresAt: MoreThan(new Date()) } })) > 0
  }

  async revoke(sessionId: string, userId: string) {
    await this.sessions.delete({ id: sessionId, userId })
  }

  /** Ferme toutes les sessions du compte, sauf éventuellement celle en cours. */
  async revokeAll(userId: string, exceptSessionId?: string) {
    await this.sessions.delete(exceptSessionId ? { userId, id: Not(exceptSessionId) } : { userId })
  }
}
