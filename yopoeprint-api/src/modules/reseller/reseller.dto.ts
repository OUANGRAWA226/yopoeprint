import {
  IsString, IsOptional, IsIn, IsBoolean, IsEmail, IsUrl,
  MinLength, MaxLength, Matches, ValidateNested,
} from 'class-validator'
import { Transform, Type } from 'class-transformer'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

const trim = ({ value }) => (typeof value === 'string' ? value.trim() : value)

export class ResellerApplyDto {
  @ApiProperty({ example: 'Studio Graphique Sahel' })
  @Transform(trim)
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  companyName: string

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(100)
  contactName?: string

  @ApiProperty({ example: '+226 70 12 34 56' })
  @Transform(trim)
  @Matches(/^\+?[0-9 .-]{8,20}$/, { message: 'Numéro de téléphone invalide' })
  phone: string

  @ApiProperty({ enum: ['low', 'medium', 'high'] })
  @IsIn(['low', 'medium', 'high'])
  volume: 'low' | 'medium' | 'high'

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(2000)
  message?: string
}

export class WhiteLabelSenderDto {
  @ApiProperty()
  @Transform(trim)
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  companyName: string

  @ApiProperty()
  @Transform(trim)
  @Matches(/^\+?[0-9 .-]{8,20}$/, { message: 'Numéro de téléphone invalide' })
  phone: string

  @ApiProperty()
  @Transform(trim)
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  address: string

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(trim)
  @IsEmail({}, { message: 'Adresse email invalide' })
  email?: string

  @ApiPropertyOptional({ description: 'URL renvoyée par POST /upload' })
  @IsOptional()
  @IsUrl({ protocols: ['https'], require_protocol: true })
  @Matches(/^https:\/\/res\.cloudinary\.com\//, { message: 'Logo invalide' })
  logoUrl?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  includeInvoice?: boolean
}

export class UpdateWhiteLabelDto {
  @ApiProperty({ type: WhiteLabelSenderDto })
  @ValidateNested()
  @Type(() => WhiteLabelSenderDto)
  sender: WhiteLabelSenderDto
}

export class AdminResellerQueryDto {
  @ApiPropertyOptional({ enum: ['pending', 'approved', 'rejected', 'suspended', 'all'] })
  @IsOptional()
  @IsIn(['pending', 'approved', 'rejected', 'suspended', 'all'])
  status?: string
}

export class AdminResellerDecisionDto {
  @ApiProperty({ enum: ['approve', 'reject', 'suspend'] })
  @IsIn(['approve', 'reject', 'suspend'])
  action: 'approve' | 'reject' | 'suspend'
}
