import {
  IsString, IsBoolean, IsOptional, IsDateString, IsArray, IsUUID, MaxLength, MinLength, Matches, ArrayMaxSize,
} from 'class-validator'
import { Transform } from 'class-transformer'
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger'

const trim = ({ value }) => (typeof value === 'string' ? value.trim() : value)
// Chaîne vide = champ effacé
const emptyToNull = ({ value }) => (typeof value === 'string' && value.trim() === '' ? null : trim({ value }))

// Formats imposés : le carrousel affiche ces ratios exacts (ordinateur et téléphone)
export const BANNER_FORMATS = {
  desktop: { width: 1248, height: 357 },
  mobile:  { width: 660,  height: 330 },
} as const
export type BannerVariant = keyof typeof BANNER_FORMATS

// Lien interne (/catalogue/...) ou page externe en https
const LINK = /^(\/[^\s]*|https:\/\/[^\s]+)$/

export class CreateBannerDto {
  @ApiProperty() @Transform(trim) @IsString() @MinLength(2) @MaxLength(120)
  title: string

  @ApiPropertyOptional() @IsOptional() @Transform(emptyToNull) @IsString() @MaxLength(200)
  subtitle?: string | null

  @ApiPropertyOptional() @IsOptional() @Transform(emptyToNull) @IsString() @MaxLength(40)
  badge?: string | null

  @ApiPropertyOptional({ description: 'Bouton affiché sur la photo ; vide si le visuel porte son propre texte' })
  @IsOptional() @Transform(emptyToNull) @IsString() @MaxLength(40)
  ctaLabel?: string | null

  @ApiPropertyOptional() @IsOptional() @Transform(emptyToNull) @IsString() @MaxLength(200)
  altText?: string | null

  @ApiProperty({ description: 'URL renvoyée par POST /admin/banners/image?variant=desktop' })
  @Transform(trim) @IsString()
  imageUrl: string

  @ApiPropertyOptional({ description: 'URL renvoyée par POST /admin/banners/image?variant=mobile' })
  @IsOptional() @Transform(emptyToNull) @IsString()
  mobileImageUrl?: string | null

  @ApiProperty({ example: '/catalogue/cartes-de-visite' })
  @Transform(trim) @Matches(LINK, { message: 'Lien invalide : chemin interne (/catalogue/...) ou adresse https://' }) @MaxLength(300)
  linkUrl: string

  @ApiPropertyOptional() @IsOptional() @IsBoolean()
  active?: boolean

  @ApiPropertyOptional() @IsOptional() @Transform(emptyToNull) @IsDateString({}, { message: 'Date de début invalide' })
  startDate?: string | null

  @ApiPropertyOptional() @IsOptional() @Transform(emptyToNull) @IsDateString({}, { message: 'Date de fin invalide' })
  endDate?: string | null
}

export class UpdateBannerDto extends PartialType(CreateBannerDto) {}

export class ReorderBannersDto {
  @ApiProperty({ type: [String], description: 'Identifiants dans l\'ordre d\'affichage' })
  @IsArray() @ArrayMaxSize(50) @IsUUID('4', { each: true })
  ids: string[]
}
