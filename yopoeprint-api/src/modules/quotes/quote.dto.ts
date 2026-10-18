import {
  IsString, IsEmail, IsOptional, IsBoolean, IsEnum, IsInt, IsArray, IsUrl,
  MinLength, MaxLength, Min, ArrayMaxSize, Matches,
} from 'class-validator'
import { Transform } from 'class-transformer'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { QuoteStatus } from './quote.entity'

const trim = ({ value }) => (typeof value === 'string' ? value.trim() : value)

export class CreateQuoteDto {
  @ApiProperty({ example: 'Salimata Kaboré' })
  @Transform(trim)
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  fullName: string

  @ApiProperty({ example: 'salimata@example.com' })
  @Transform(trim)
  @IsEmail({}, { message: 'Adresse email invalide' })
  @MaxLength(150)
  email: string

  @ApiProperty({ example: '+226 70 00 00 00' })
  @Transform(trim)
  @IsString()
  @Matches(/^\+?[0-9 .-]{8,20}$/, { message: 'Numéro de téléphone invalide' })
  phone: string

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(150)
  company?: string

  @ApiProperty({ example: 'Entreprise / PME / Grande Entreprise' })
  @IsString()
  @MaxLength(100)
  profile: string

  @ApiProperty({ example: 'Flyers & Dépliants' })
  @Transform(trim)
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  product: string

  @ApiProperty({ example: '2 000 exemplaires' })
  @Transform(trim)
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  quantity: string

  @ApiPropertyOptional({ example: 'A5' })
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(100)
  format?: string

  @ApiProperty()
  @Transform(trim)
  @IsString()
  @MinLength(15, { message: 'Description trop courte (15 caractères minimum)' })
  @MaxLength(5000)
  description: string

  @ApiProperty({ example: '50 000 – 150 000 FCFA' })
  @IsString()
  @MaxLength(100)
  budget: string

  @ApiProperty({ example: 'Standard (3 - 5 jours ouvrés)' })
  @IsString()
  @MaxLength(100)
  deadline: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hasFile?: boolean

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(1000)
  fileDesc?: string

  @ApiPropertyOptional({ description: 'URLs renvoyées par POST /upload', type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsUrl({ protocols: ['https'], require_protocol: true }, { each: true })
  @Matches(/^https:\/\/res\.cloudinary\.com\//, { each: true, message: 'Fichier joint invalide' })
  files?: string[]
}

export class UpdateQuoteStatusDto {
  @ApiProperty({ enum: QuoteStatus })
  @IsEnum(QuoteStatus)
  status: QuoteStatus

  @ApiPropertyOptional({ example: 185000, description: 'Montant proposé en FCFA' })
  @IsOptional()
  @IsInt()
  @Min(0)
  price?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  adminNotes?: string
}

export class QuoteQueryDto {
  @ApiPropertyOptional({ enum: QuoteStatus })
  @IsOptional()
  @IsEnum(QuoteStatus)
  status?: QuoteStatus

  @ApiPropertyOptional()
  @IsOptional()
  page?: string

  @ApiPropertyOptional()
  @IsOptional()
  limit?: string
}
