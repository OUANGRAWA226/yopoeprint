import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'

export class AuditQueryDto {
  @ApiPropertyOptional({ description: "Préfixe d'action, ex. « product » ou « team.role »" })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  action?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  actorId?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(64)
  targetId?: string

  @ApiPropertyOptional()
  @IsOptional()
  page?: string

  @ApiPropertyOptional()
  @IsOptional()
  limit?: string
}
