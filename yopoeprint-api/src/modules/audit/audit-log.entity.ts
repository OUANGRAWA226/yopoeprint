import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm'

// Journal des actions sensibles du back-office (qui, quoi, sur quoi, quand)
@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Index()
  @Column({ name: 'actor_id', type: 'uuid', nullable: true })
  actorId: string | null

  @Column({ name: 'actor_email', type: 'varchar', nullable: true })
  actorEmail: string | null

  @Column({ name: 'actor_role', type: 'varchar', length: 20, nullable: true })
  actorRole: string | null

  @Index()
  @Column({ type: 'varchar', length: 80 })
  action: string

  @Column({ name: 'target_type', type: 'varchar', length: 40, nullable: true })
  targetType: string | null

  @Index()
  @Column({ name: 'target_id', type: 'varchar', length: 64, nullable: true })
  targetId: string | null

  @Column({ type: 'jsonb', nullable: true })
  details: Record<string, unknown> | null

  @Column({ type: 'varchar', length: 64, nullable: true })
  ip: string | null

  @Index()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date
}
