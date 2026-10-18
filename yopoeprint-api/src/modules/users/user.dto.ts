import {
  IsString, IsEmail, IsOptional, IsBoolean, IsIn, IsArray,
  MinLength, MaxLength, Matches, ValidateNested, ArrayMaxSize, ValidateIf,
} from 'class-validator'
import { Transform, Type } from 'class-transformer'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { UserRole } from './user.entity'

const trim = ({ value }) => (typeof value === 'string' ? value.trim() : value)
// "+226 70 00 00 00" → "+22670000000" ; "" → null (efface le numéro)
const normalizePhone = ({ value }) =>
  typeof value === 'string' ? (value.replace(/[\s.-]/g, '') || null) : value

export class AddressDto {
  @ApiProperty()
  @IsString()
  @MaxLength(50)
  id: string

  @ApiPropertyOptional({ enum: ['home', 'work', 'other'] })
  @IsOptional()
  @IsIn(['home', 'work', 'other'])
  labelType?: 'home' | 'work' | 'other'

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  label?: string

  @ApiProperty()
  @Transform(trim)
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  fullName: string

  @ApiProperty()
  @Transform(trim)
  @IsString()
  @Matches(/^\+?[0-9 .-]{8,20}$/, { message: 'Numéro de téléphone invalide' })
  phone: string

  @ApiProperty()
  @Transform(trim)
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  street: string

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(100)
  neighborhood?: string

  @ApiProperty()
  @Transform(trim)
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  city: string

  @ApiProperty()
  @IsBoolean()
  isDefault: boolean
}

export class UpdateProfileDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  firstName?: string

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  lastName?: string

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(trim)
  @IsEmail({}, { message: 'Adresse email invalide' })
  email?: string

  @ApiPropertyOptional({ example: '+22670000000', nullable: true })
  @IsOptional()
  @Transform(normalizePhone)
  @ValidateIf((_, v) => v !== null)
  @Matches(/^\+?[0-9]{8,15}$/, { message: 'Numéro de téléphone invalide' })
  phone?: string | null

  @ApiPropertyOptional({ type: [AddressDto] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @ValidateNested({ each: true })
  @Type(() => AddressDto)
  addresses?: AddressDto[]
}

export class ChangePasswordDto {
  @ApiProperty()
  @IsString()
  currentPassword: string

  @ApiProperty()
  @IsString()
  @MinLength(8, { message: 'Mot de passe trop court (8 caractères minimum)' })
  @MaxLength(100)
  newPassword: string
}

// ─── Admin ────────────────────────────────────────────────────
export class AdminUsersQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string

  @ApiPropertyOptional({ enum: ['VIP', 'Actif', 'Nouveau', 'Inactif', 'all'] })
  @IsOptional()
  @IsIn(['VIP', 'Actif', 'Nouveau', 'Inactif', 'all'])
  segment?: string

  @ApiPropertyOptional({ enum: ['client', 'reseller', 'admin', 'staff', 'all'], description: 'Défaut : client' })
  @IsOptional()
  @IsIn(['client', 'reseller', 'admin', 'staff', 'all'])
  role?: string

  @ApiPropertyOptional()
  @IsOptional()
  page?: string

  @ApiPropertyOptional()
  @IsOptional()
  limit?: string
}

export class AdminUpdateUserDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean
}

// ─── Équipe back-office (superadmin) ──────────────────────────
const TEAM_ROLES = [UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.STAFF]

export class CreateTeamMemberDto {
  @ApiProperty()
  @Transform(trim)
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  firstName: string

  @ApiProperty()
  @Transform(trim)
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  lastName: string

  @ApiProperty()
  @Transform(trim)
  @IsEmail({}, { message: 'Adresse email invalide' })
  email: string

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(normalizePhone)
  @Matches(/^\+?[0-9]{8,15}$/, { message: 'Numéro de téléphone invalide' })
  phone?: string

  @ApiProperty()
  @IsString()
  @MinLength(10, { message: "Mot de passe trop court (10 caractères minimum pour un compte d'équipe)" })
  @MaxLength(100)
  password: string

  @ApiProperty({ enum: TEAM_ROLES })
  @IsIn(TEAM_ROLES)
  role: UserRole
}

export class SetTeamRoleDto {
  @ApiProperty({ enum: [...TEAM_ROLES, UserRole.CLIENT], description: "client = retirer de l'équipe" })
  @IsIn([...TEAM_ROLES, UserRole.CLIENT])
  role: UserRole
}

export class SetTeamActiveDto {
  @ApiProperty()
  @IsBoolean()
  isActive: boolean
}
