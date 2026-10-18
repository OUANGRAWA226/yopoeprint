import {
  IsString, IsIn, IsInt, IsBoolean, IsOptional, IsDateString, Min, Max, MaxLength, Matches,
} from 'class-validator'
import { Transform } from 'class-transformer'
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger'

const upper = ({ value }) => (typeof value === 'string' ? value.trim().toUpperCase() : value)
const emptyToNull = ({ value }) => (typeof value === 'string' && value.trim() === '' ? null : value)

export class CreatePromoDto {
  @ApiProperty({ example: 'RENTREE15' })
  @Transform(upper) @Matches(/^[A-Z0-9_-]{3,30}$/, { message: 'Code : 3 à 30 lettres, chiffres, - ou _' })
  code: string

  @ApiProperty({ enum: ['percentage', 'fixed'] })
  @IsIn(['percentage', 'fixed'])
  type: 'percentage' | 'fixed'

  @ApiProperty({ description: 'Pourcentage (1 à 90) ou montant en FCFA' })
  @IsInt() @Min(1)
  value: number

  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0)
  minOrder?: number

  @ApiPropertyOptional({ description: 'Vide = illimité' })
  @IsOptional() @Transform(emptyToNull) @IsInt() @Min(1)
  maxUses?: number | null

  @ApiPropertyOptional() @IsOptional() @IsBoolean()
  oncePerCustomer?: boolean

  @ApiPropertyOptional() @IsOptional() @Transform(emptyToNull) @IsString() @MaxLength(120)
  description?: string | null

  @ApiPropertyOptional() @IsOptional() @IsBoolean()
  active?: boolean

  @ApiPropertyOptional({ description: 'Code affiché sur la boutique (un seul à la fois)' })
  @IsOptional() @IsBoolean()
  featured?: boolean

  @ApiPropertyOptional() @IsOptional() @Transform(emptyToNull) @IsDateString({}, { message: 'Date de début invalide' })
  startDate?: string | null

  @ApiPropertyOptional() @IsOptional() @Transform(emptyToNull) @IsDateString({}, { message: 'Date de fin invalide' })
  endDate?: string | null
}

export class UpdatePromoDto extends PartialType(CreatePromoDto) {}

export class ValidatePromoDto {
  @ApiProperty() @Transform(upper) @IsString() @MaxLength(30)
  code: string

  @ApiProperty({ description: 'Sous-total du panier en FCFA' })
  @IsInt() @Min(0) @Max(1_000_000_000)
  orderTotal: number
}
