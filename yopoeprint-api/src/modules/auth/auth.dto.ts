import {
  IsEmail, IsString, IsOptional, IsBoolean, Equals,
  MinLength, MaxLength, Matches,
} from 'class-validator'
import { Transform } from 'class-transformer'
import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger'
import { normalizeEmail, normalizePhone } from '../../common/identity'

const trim = ({ value }) => (typeof value === 'string' ? value.trim() : value)

// ─── Register ─────────────────────────────────────────────────
export class RegisterDto {
  @ApiProperty({ example: 'Salimata' })
  @Transform(trim)
  @IsString()
  @MinLength(1, { message: 'Prénom requis' })
  @MaxLength(50)
  firstName: string

  @ApiProperty({ example: 'Kaboré' })
  @Transform(trim)
  @IsString()
  @MinLength(1, { message: 'Nom requis' })
  @MaxLength(50)
  lastName: string

  @ApiProperty({ example: 'salimata@example.com' })
  @Transform(normalizeEmail)
  @IsEmail({}, { message: 'Adresse email invalide' })
  email: string

  @ApiPropertyOptional({ example: '+226 70 00 00 00' })
  @IsOptional()
  @Transform(normalizePhone)
  @Matches(/^\+?[0-9]{8,15}$/, { message: 'Numéro de téléphone invalide' })
  phone?: string

  @ApiProperty({ example: 'MotDePasse123!' })
  @IsString()
  @MinLength(8, { message: 'Mot de passe trop court (8 caractères minimum)' })
  @MaxLength(100)
  password: string

  @ApiProperty({ description: 'Date de naissance (AAAA-MM-JJ)', example: '1995-04-21' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Date de naissance invalide' })
  birthDate: string

  @ApiProperty({ description: 'Acceptation des CGV et de la politique de confidentialité', example: true })
  @IsBoolean({ message: 'Acceptez les conditions générales pour créer un compte' })
  @Equals(true, { message: 'Acceptez les conditions générales pour créer un compte' })
  acceptTerms: boolean
}

// Premier administrateur (installation) : mêmes champs, sans les CGV ni la date de naissance clients
export class SetupAdminDto extends OmitType(RegisterDto, ['acceptTerms', 'birthDate'] as const) {}

// Étape 1 de l'inscription : l'adresse a-t-elle déjà un compte ?
export class CheckEmailDto {
  @ApiProperty({ example: 'salimata@example.com' })
  @Transform(normalizeEmail)
  @IsEmail({}, { message: 'Adresse email invalide' })
  email: string
}

// « Continuer avec Google » : jeton d'identité (JWT) renvoyé par Google Identity Services
export class GoogleAuthDto {
  @ApiProperty({ description: 'credential renvoyé par le bouton Google' })
  @IsString() @MinLength(20) @MaxLength(4096)
  credential: string
}

// Nouveau compte Google : profil de l'étape 3 (l'email vient de Google, pas de mot de passe)
export class GoogleCompleteDto extends OmitType(RegisterDto, ['email', 'password'] as const) {
  @ApiProperty({ description: 'credential renvoyé par le bouton Google' })
  @IsString() @MinLength(20) @MaxLength(4096)
  credential: string
}

// ─── Login ────────────────────────────────────────────────────
export class LoginDto {
  @ApiProperty({ example: 'salimata@example.com' })
  @Transform(normalizeEmail)
  @IsEmail({}, { message: 'Adresse email invalide' })
  email: string

  @ApiProperty({ example: 'MotDePasse123!' })
  @IsString()
  password: string
}

// ─── Refresh Token ────────────────────────────────────────────
export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  refreshToken: string
}

// ─── Auth Response ────────────────────────────────────────────
export class AuthResponseDto {
  @ApiProperty()
  accessToken: string

  @ApiProperty()
  refreshToken: string

  @ApiProperty()
  user: {
    id: string
    email: string
    firstName: string
    lastName: string
    role: string
    loyaltyPoints: number
  }
}

// ─── Mot de passe oublié ──────────────────────────────────────
export class ForgotPasswordDto {
  @ApiProperty({ example: 'salimata@example.com' })
  @Transform(normalizeEmail)
  @IsEmail({}, { message: 'Adresse email invalide' })
  email: string
}

export class ResetPasswordDto {
  @ApiProperty({ description: 'Jeton reçu par email' })
  @IsString()
  @Matches(/^[a-f0-9]{64}$/, { message: 'Lien de réinitialisation invalide' })
  token: string

  @ApiProperty({ example: 'NouveauMotDePasse123!' })
  @IsString()
  @MinLength(8, { message: 'Mot de passe trop court (8 caractères minimum)' })
  @MaxLength(100)
  newPassword: string
}
