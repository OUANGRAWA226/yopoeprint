import { Entity, PrimaryColumn, Column, UpdateDateColumn } from 'typeorm'

// Une seule ligne (id = 1) : les paramètres de la plateforme en JSON validé par UpdateSettingsDto
@Entity('platform_settings')
export class PlatformSettingsRow {
  @PrimaryColumn({ type: 'int' })
  id: number

  @Column({ type: 'jsonb', default: {} })
  data: Record<string, unknown>

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy: string | null

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date
}
