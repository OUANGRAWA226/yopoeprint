import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn, OneToMany,
} from 'typeorm'
import { Order } from '../orders/order.entity'

export enum UserRole {
  CLIENT = 'client',
  ADMIN  = 'admin',
  STAFF  = 'staff',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ name: 'first_name' })
  firstName: string

  @Column({ name: 'last_name' })
  lastName: string

  @Column({ unique: true })
  email: string

  @Column({ unique: true, nullable: true })
  phone: string

  @Column({ name: 'password_hash' })
  passwordHash: string

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CLIENT,
  })
  role: UserRole

  @Column({ name: 'loyalty_points', default: 0 })
  loyaltyPoints: number

  @Column({ name: 'is_active', default: true })
  isActive: boolean

  @Column({ name: 'email_verified', default: false })
  emailVerified: boolean

  @Column({ name: 'refresh_token', nullable: true })
  refreshToken: string

  // Mot de passe oublié : empreinte SHA-256 du jeton envoyé par email (usage unique, 1 h)
  @Column({ name: 'password_reset_token_hash', type: 'varchar', nullable: true })
  passwordResetTokenHash: string | null

  @Column({ name: 'password_reset_expires_at', type: 'timestamptz', nullable: true })
  passwordResetExpiresAt: Date | null

  // Addresses stored as JSONB (flexible)
  @Column({ type: 'jsonb', default: [] })
  addresses: Address[]

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[]

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date

  // Virtual: full name
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`
  }
}

export interface Address {
  id: string
  label?: string
  labelType?: 'home' | 'work' | 'other'
  fullName: string
  phone: string
  street: string
  neighborhood: string
  city: string
  isDefault: boolean
}
