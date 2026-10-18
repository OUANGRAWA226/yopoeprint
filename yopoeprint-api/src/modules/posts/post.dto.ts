import { IsString, IsBoolean, IsOptional, MaxLength, MinLength, Matches } from 'class-validator'
import { Transform } from 'class-transformer'
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger'

const trim = ({ value }) => (typeof value === 'string' ? value.trim() : value)
const emptyToNull = ({ value }) => (typeof value === 'string' && value.trim() === '' ? null : trim({ value }))

export class CreatePostDto {
  @ApiProperty() @Transform(trim) @IsString() @MinLength(5) @MaxLength(160)
  title: string

  @ApiProperty({ example: 'quel-grammage-papier-choisir' })
  @Transform(trim) @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { message: 'Adresse de l\'article : minuscules, chiffres et tirets' }) @MaxLength(120)
  slug: string

  @ApiProperty({ description: 'Résumé (listes et résultats Google)' })
  @Transform(trim) @IsString() @MinLength(20) @MaxLength(300)
  excerpt: string

  @ApiProperty({ description: 'Contenu en Markdown' })
  @IsString() @MinLength(50) @MaxLength(60000)
  content: string

  @ApiProperty() @Transform(trim) @IsString() @MinLength(2) @MaxLength(60)
  category: string

  @ApiPropertyOptional() @IsOptional() @Transform(trim) @IsString() @MaxLength(80)
  author?: string

  // Hôtes autorisés par next.config.js (remotePatterns) : une autre adresse ferait planter la page article
  @ApiPropertyOptional({ description: 'Image de couverture (envoyée par POST /admin/media)' })
  @IsOptional() @Transform(emptyToNull)
  @Matches(/^https:\/\/(res\.cloudinary\.com|images\.unsplash\.com)\/[^\s]+$/, { message: 'Image de couverture : envoyez-la depuis l\'admin (Cloudinary) ou une image Unsplash' })
  imageUrl?: string | null

  @ApiPropertyOptional() @IsOptional() @IsBoolean()
  published?: boolean
}

export class UpdatePostDto extends PartialType(CreatePostDto) {}
