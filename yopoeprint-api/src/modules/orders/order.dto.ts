import {
  IsString, IsArray, IsInt, IsEnum,
  IsOptional, IsBoolean, ValidateNested, Min,
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

  @ApiProperty({ example: 'none' })
  @IsString()
  finishId: string

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

  @ApiProperty({ example: 'Rue 14.57, Secteur 15' })
  @IsString()
  street: string

  @ApiProperty({ example: 'Wemtenga' })
  @IsString()
  neighborhood: string

  @ApiProperty({ example: 'Ouagadougou' })
  @IsString()
  city: string
}

export class CreateOrderDto {
  @ApiProperty({ type: [OrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[]

  @ApiProperty({ type: DeliveryAddressDto })
  @ValidateNested()
  @Type(() => DeliveryAddressDto)
  deliveryAddress: DeliveryAddressDto

  @ApiProperty({ enum: PaymentMethod })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod

  @ApiPropertyOptional({ example: 'PROMO10' })
  @IsOptional()
  @IsString()
  promoCode?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  customerNotes?: string
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
}
