import {
  IsString, IsEnum, IsInt, IsBoolean,
  IsOptional, IsArray, Min, MaxLength,
} from 'class-validator'
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { ProductCategory, ProductBadge } from './product.entity'

export class CreateProductDto {
  @ApiProperty({ example: 'Flyer A5 classique' })
  @IsString()
  @MaxLength(100)
  name: string

  @ApiProperty({ example: 'flyer-a5-classique' })
  @IsString()
  slug: string

  @ApiProperty()
  @IsString()
  description: string

  @ApiProperty()
  @IsString()
  shortDesc: string

  @ApiProperty({ enum: ProductCategory })
  @IsEnum(ProductCategory)
  category: ProductCategory

  @ApiPropertyOptional({ enum: ProductBadge })
  @IsOptional()
  @IsEnum(ProductBadge)
  badge?: ProductBadge

  @ApiProperty({ example: '📄' })
  @IsString()
  emoji: string

  @ApiProperty({ example: 'linear-gradient(135deg, #E8EEF8, #C5D4F0)' })
  @IsString()
  bgGradient: string

  @ApiPropertyOptional({ description: 'URL de l\'image Cloudinary' })
  @IsOptional()
  @IsString()
  imageUrl?: string
  @ApiPropertyOptional({ description: 'Galerie d\'images pour la page produit' })
  @IsOptional()
  @IsArray()
  @Type(() => Object) // garde des objets simples (sinon conversion implicite en [[]])
  images?: any[]
  @ApiProperty({ example: 8500, description: 'Prix de base en FCFA' })
  @IsInt()
  @Min(0)
  basePrice: number

  @ApiProperty({ example: 500 })
  @IsInt()
  @Min(1)
  minQuantity: number

  @ApiProperty()
  @IsArray()
  @Type(() => Object) // garde des objets simples (sinon conversion implicite en [[]])
  formats: any[]

  @ApiProperty()
  @IsArray()
  @Type(() => Object) // garde des objets simples (sinon conversion implicite en [[]])
  papers: any[]

  @ApiProperty({ example: [250, 500, 1000, 2000] })
  @IsArray()
  quantities: number[]

  @ApiProperty()
  @IsArray()
  @Type(() => Object) // garde des objets simples (sinon conversion implicite en [[]])
  finishes: any[]

  @ApiProperty({ example: 2 })
  @IsInt()
  @Min(1)
  deliveryDays: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPopular?: boolean

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  sortOrder?: number

  @ApiPropertyOptional({ description: 'Mis en avant dans les offres de l\'accueil et le méga-menu' })
  @IsOptional()
  @IsBoolean()
  isHomeOffer?: boolean

  @ApiPropertyOptional({ description: 'Proposé dans le calculateur de prix de l\'accueil' })
  @IsOptional()
  @IsBoolean()
  inCalculator?: boolean

  @ApiPropertyOptional({ description: 'Quantité de référence du prix affiché (vide = quantité minimale)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  offerQuantity?: number | null
}

export class UpdateProductDto extends PartialType(CreateProductDto) {}

export class ProductQueryDto {
  @ApiPropertyOptional({ enum: ProductCategory })
  @IsOptional()
  @IsEnum(ProductCategory)
  category?: ProductCategory

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string

  @ApiPropertyOptional({ example: '1' })
  @IsOptional()
  page?: string

  @ApiPropertyOptional({ example: '12' })
  @IsOptional()
  limit?: string

  @ApiPropertyOptional({ example: 'popular' })
  @IsOptional()
  sortBy?: string

  @ApiPropertyOptional({ description: '[ADMIN] Inclure les produits désactivés (ignoré sans token admin)' })
  @IsOptional()
  includeInactive?: string
}

// ─── Price Calculator DTO ─────────────────────────────────────
export class CalculatePriceDto {
  @ApiProperty()
  @IsString()
  productId: string

  @ApiProperty({ example: 500 })
  @IsInt()
  @Min(1)
  quantity: number

  @ApiProperty({ example: 'a5' })
  @IsString()
  formatId: string

  @ApiProperty({ example: 'couche-135' })
  @IsString()
  paperId: string

  @ApiProperty({ example: 'none' })
  @IsString()
  finishId: string

  @ApiProperty({ example: true })
  @IsBoolean()
  rectoverso: boolean
}

// PATCH /products/:id : mise à jour partielle + activation (le front admin envoie `active`)
export class PatchProductDto extends UpdateProductDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean

  @ApiPropertyOptional({ description: 'Alias de isActive' })
  @IsOptional()
  @IsBoolean()
  active?: boolean
}
