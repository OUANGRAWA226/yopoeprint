import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm'

// Une session par appareil connecté. Le jeton de renouvellement n'est stocké que sous
// forme d'empreinte SHA-256 ; le jeton d'accès porte l'id de session (« sid ») et
// devient invalide dès que la session est supprimée (déconnexion, mot de passe, désactivation).
@Entity('user_sessions')
export class UserSession {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Index('IDX_user_sessions_user_id')
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string

  @Column({ name: 'token_hash', type: 'varchar', length: 64 })
  tokenHash: string

  // Jeton remplacé lors de la dernière rotation, encore accepté quelques secondes :
  // deux onglets qui renouvellent en même temps ne doivent pas fermer la session
  @Column({ name: 'previous_token_hash', type: 'varchar', length: 64, nullable: true })
  previousTokenHash: string | null

  @Column({ name: 'rotated_at', type: 'timestamptz', nullable: true })
  rotatedAt: Date | null

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @Column({ name: 'last_used_at', type: 'timestamptz' })
  lastUsedAt: Date

  @Index('IDX_user_sessions_expires_at')
  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt: Date
}
