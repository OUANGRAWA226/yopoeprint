import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn, OneToMany,
} from 'typeorm'
import { Order } from '../orders/order.entity'

export enum UserRole {
  CLIENT = 'client',
  RESELLER = 'reseller',     // agence / revendeur validé : remise automatique
  STAFF  = 'staff',          // atelier : commandes, BAT, devis
  ADMIN  = 'admin',          // gestion du catalogue, des clients et des revendeurs
  SUPERADMIN = 'superadmin', // tout, plus l'équipe, les paramètres et le journal
}

// Comptes ayant accès au back-office
export const BACK_OFFICE_ROLES: UserRole[] = [UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.STAFF]
// Gestion (catalogue, clients, revendeurs) : pas l'équipe atelier
export const MANAGER_ROLES: UserRole[] = [UserRole.SUPERADMIN, UserRole.ADMIN]

export const isBackOffice = (role?: string | null) => BACK_OFFICE_ROLES.includes(role as UserRole)
export const isManager = (role?: string | null) => MANAGER_ROLES.includes(role as UserRole)

export type ResellerStatus = 'pending' | 'approved' | 'rejected' | 'suspended'

// Dossier revendeur et identité d'expédition en marque blanche
export interface ResellerProfile {
  contactName?: string
  phone?: string
  volume?: 'low' | 'medium' | 'high'
  message?: string
  sender?: {
    companyName: string
    phone: string
    address: string
    email?: string
    logoUrl?: string
    includeInvoice?: boolean // glisser la facture du revendeur dans le colis
  }
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

  // Date de naissance saisie à l'inscription (AAAA-MM-JJ) ; null pour les comptes plus anciens
  @Column({ name: 'birth_date', type: 'date', nullable: true })
  birthDate: string | null

  // Date d'acceptation des CGV et de la politique de confidentialité (inscription) ; null pour les comptes plus anciens
  @Column({ name: 'terms_accepted_at', type: 'timestamptz', nullable: true })
  termsAcceptedAt: Date | null

  @Column({ name: 'refresh_token', nullable: true })
  refreshToken: string

  // Mot de passe oublié : empreinte SHA-256 du jeton envoyé par email (usage unique, 1 h)
  @Column({ name: 'password_reset_token_hash', type: 'varchar', nullable: true })
  passwordResetTokenHash: string | null

  @Column({ name: 'password_reset_expires_at', type: 'timestamptz', nullable: true })
  passwordResetExpiresAt: Date | null

  // ── Programme revendeur ──
  @Column({ name: 'company_name', type: 'varchar', nullable: true })
  companyName: string | null

  @Column({ name: 'reseller_status', type: 'varchar', length: 20, nullable: true })
  resellerStatus: ResellerStatus | null

  @Column({ name: 'reseller_applied_at', type: 'timestamptz', nullable: true })
  resellerAppliedAt: Date | null

  @Column({ name: 'reseller_profile', type: 'jsonb', nullable: true })
  resellerProfile: ResellerProfile | null

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
