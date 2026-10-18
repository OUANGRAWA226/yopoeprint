import {
  IsString, IsArray, IsInt, IsEnum, IsIn, ArrayMinSize,
  IsOptional, IsBoolean, ValidateNested, Min, MaxLength,
} from 'class-validator'
import { Type } from 'class-transformer'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { PaymentMethod, OrderStatus } from './order.entity'

export class OrderItemDto {
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

  @ApiPropertyOptional({ example: 'none' })
  @IsOptional()
  @IsString()
  finishId?: string

  @ApiProperty()
  @IsBoolean()
  rectoverso: boolean

  @ApiPropertyOptional({ description: 'URL Cloudinary du fichier design' })
  @IsOptional()
  @IsString()
  designFileUrl?: string
}

export class DeliveryAddressDto {
  @ApiProperty({ example: 'Salimata Kaboré' })
  @IsString()
  fullName: string

  @ApiProperty({ example: '+22670000000' })
  @IsString()
  phone: string

  @ApiPropertyOptional({ example: 'Rue 14.57, Secteur 15', description: 'Requis sauf retrait atelier' })
  @IsOptional()
  @IsString()
  street?: string

  @ApiPropertyOptional({ example: 'Wemtenga' })
  @IsOptional()
  @IsString()
  neighborhood?: string

  @ApiPropertyOptional({ example: 'Ouagadougou', description: 'Déduite de la zone de livraison' })
  @IsOptional()
  @IsString()
  city?: string
}

export class CreateOrderDto {
  @ApiProperty({ type: [OrderItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[]

  // Zones gérées dans les paramètres de la plateforme (vérifiées à la création)
  @ApiProperty({ example: 'ouaga_centre' })
  @IsString()
  @MaxLength(30)
  deliveryZone: string

  @ApiProperty({ type: DeliveryAddressDto })
  @ValidateNested()
  @Type(() => DeliveryAddressDto)
  deliveryAddress: DeliveryAddressDto

  @ApiProperty({ enum: PaymentMethod })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod

  @ApiPropertyOptional({ example: 'YOPPRINT15' })
  @IsOptional()
  @IsString()
  promoCode?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  customerNotes?: string

  @ApiPropertyOptional({ description: '[REVENDEUR] Colis neutre et bordereau au nom du revendeur' })
  @IsOptional()
  @IsBoolean()
  whiteLabel?: boolean
}

export class UpdateOrderStatusDto {
  @ApiProperty({ enum: OrderStatus })
  @IsEnum(OrderStatus)
  status: OrderStatus

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  internalNotes?: string
}

export class OrderQueryDto {
  @ApiPropertyOptional({ enum: OrderStatus })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus

  @ApiPropertyOptional()
  @IsOptional()
  page?: string

  @ApiPropertyOptional()
  @IsOptional()
  limit?: string

  @ApiPropertyOptional({ enum: ['pending', 'approved', 'rejected'], description: '[ADMIN] État du BAT' })
  @IsOptional()
  @IsIn(['pending', 'approved', 'rejected'])
  batStatus?: 'pending' | 'approved' | 'rejected'

  @ApiPropertyOptional({ description: '[ADMIN] N° de commande, nom, email ou téléphone du client' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string
}

export class AdminStatsQueryDto {
  @ApiPropertyOptional({ enum: ['7', '30', '90'], description: 'Période en jours (défaut 30)' })
  @IsOptional()
  @IsIn(['7', '30', '90'])
  days?: '7' | '30' | '90'
}

export class AttachDesignFileDto {
  @ApiProperty({ description: 'URL Cloudinary du fichier design' })
  @IsString()
  designFileUrl: string
}

export class UploadBatDto {
  @ApiProperty({ description: 'URL du fichier BAT Recto ou principal', example: 'https://res.cloudinary.com/.../bat-recto.png' })
  @IsString()
  batUrl: string

  @ApiPropertyOptional({ description: 'URL du fichier BAT Verso (si produit recto/verso)', example: 'https://res.cloudinary.com/.../bat-verso.png' })
  @IsOptional()
  @IsString()
  batVersoUrl?: string

  @ApiPropertyOptional({ description: 'Remarques techniques pré-presse pour le client', example: 'Bords perdus ajustés de 3mm. Vérifiez bien l\'orthographe du numéro de téléphone.' })
  @IsOptional()
  @IsString()
  batNotes?: string
}

export class ApproveBatDto {
  @ApiPropertyOptional({ description: 'Commentaire facultatif du client lors de la validation', example: 'BAT validé, conforme à nos attentes.' })
  @IsOptional()
  @IsString()
  comments?: string
}

export class RejectBatDto {
  @ApiProperty({ description: 'Motif de refus ou détails des corrections souhaitées', example: 'Veuillez corriger le logo et décaler le numéro de téléphone vers la droite.' })
  @IsString()
  reason: string

  @ApiPropertyOptional({ description: 'URL d\'un nouveau fichier ou capture d\'écran annotée', example: 'https://res.cloudinary.com/.../correction-notes.png' })
  @IsOptional()
  @IsString()
  correctionFileUrl?: string
}

