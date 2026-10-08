import {
  IsEmail, IsString, IsOptional,
  MinLength, MaxLength, Matches,
} from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

// ─── Register ─────────────────────────────────────────────────
export class RegisterDto {
  @ApiProperty({ example: 'Salimata' })
  @IsString()
  @MaxLength(50)
  firstName: string

  @ApiProperty({ example: 'Kaboré' })
  @IsString()
  @MaxLength(50)
  lastName: string

  @ApiProperty({ example: 'salimata@example.com' })
  @IsEmail()
  email: string

  @ApiPropertyOptional({ example: '+22670000000' })
  @IsOptional()
  @Matches(/^\+?[0-9]{8,15}$/, { message: 'Numéro de téléphone invalide' })
  phone?: string

  @ApiProperty({ example: 'MotDePasse123!' })
  @IsString()
  @MinLength(8, { message: 'Mot de passe trop court (8 caractères minimum)' })
  @MaxLength(100)
  password: string
}

// ─── Login ────────────────────────────────────────────────────
export class LoginDto {
  @ApiProperty({ example: 'salimata@example.com' })
  @IsEmail()
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
