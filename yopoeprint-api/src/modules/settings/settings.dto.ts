import {
  IsString, IsEmail, IsInt, IsBoolean, IsArray, Min, Max, MaxLength, MinLength, Matches,
  ValidateNested, ArrayMinSize, ArrayMaxSize,
} from 'class-validator'
import { Transform, Type } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'

const trim = ({ value }) => (typeof value === 'string' ? value.trim() : value)
const SLUG = /^[a-z0-9_-]{2,30}$/

export class ContactSettingsDto {
  @ApiProperty() @Transform(trim) @Matches(/^\+?[0-9 .-]{8,20}$/, { message: 'Téléphone invalide' })
  phone: string

  @ApiProperty() @Transform(trim) @Matches(/^\+?[0-9 .-]{8,20}$/, { message: 'Numéro WhatsApp invalide' })
  whatsapp: string

  @ApiProperty() @Transform(trim) @IsEmail({}, { message: 'Email de contact invalide' })
  email: string

  @ApiProperty() @Transform(trim) @IsString() @MinLength(3) @MaxLength(200)
  address: string
}

export class DeliveryZoneDto {
  @ApiProperty() @Matches(SLUG, { message: 'Identifiant de zone invalide (minuscules, chiffres, - ou _)' })
  id: string

  @ApiProperty() @Transform(trim) @IsString() @MinLength(2) @MaxLength(60)
  label: string

  @ApiProperty() @Transform(trim) @IsString() @MinLength(2) @MaxLength(60)
  city: string

  @ApiProperty() @IsInt() @Min(0) @Max(1_000_000)
  price: number

  @ApiProperty() @Transform(trim) @IsString() @MaxLength(30)
  delay: string

  @ApiProperty() @IsBoolean()
  enabled: boolean

  @ApiProperty() @IsBoolean()
  freeEligible: boolean
}

export class DeliverySettingsDto {
  @ApiProperty() @IsInt() @Min(0) @Max(100_000_000)
  freeThreshold: number

  @ApiProperty({ type: [DeliveryZoneDto] })
  @IsArray() @ArrayMinSize(1) @ArrayMaxSize(30)
  @ValidateNested({ each: true }) @Type(() => DeliveryZoneDto)
  zones: DeliveryZoneDto[]
}

export class ResellerTierDto {
  @ApiProperty() @Matches(SLUG, { message: 'Identifiant de palier invalide' })
  id: string

  @ApiProperty() @Transform(trim) @IsString() @MinLength(2) @MaxLength(40)
  label: string

  @ApiProperty() @IsInt() @Min(0) @Max(50)
  rate: number

  @ApiProperty() @IsInt() @Min(0)
  minRevenue: number
}

export class MaintenanceSettingsDto {
  @ApiProperty() @IsBoolean()
  enabled: boolean

  @ApiProperty() @Transform(trim) @IsString() @MaxLength(300)
  message: string
}

export class UpdateSettingsDto {
  @ApiProperty({ type: ContactSettingsDto }) @ValidateNested() @Type(() => ContactSettingsDto)
  contact: ContactSettingsDto

  @ApiProperty({ type: DeliverySettingsDto }) @ValidateNested() @Type(() => DeliverySettingsDto)
  delivery: DeliverySettingsDto

  @ApiProperty({ type: [ResellerTierDto] })
  @IsArray() @ArrayMinSize(1) @ArrayMaxSize(10)
  @ValidateNested({ each: true }) @Type(() => ResellerTierDto)
  resellerTiers: ResellerTierDto[]

  @ApiProperty({ type: MaintenanceSettingsDto }) @ValidateNested() @Type(() => MaintenanceSettingsDto)
  maintenance: MaintenanceSettingsDto
}
