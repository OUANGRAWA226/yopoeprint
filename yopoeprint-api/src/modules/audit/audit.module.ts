import { Controller, Get, Query, UseGuards, Global, Module } from '@nestjs/common'
import { APP_INTERCEPTOR } from '@nestjs/core'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { AuditLog } from './audit-log.entity'
import { AuditService } from './audit.service'
import { AuditInterceptor } from './audit.interceptor'
import { AuditQueryDto } from './audit.dto'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { SuperAdminGuard } from '../../common/guards/admin.guard'

@ApiTags('Administration - Journal')
@Controller('admin/audit-logs')
@UseGuards(JwtAuthGuard, SuperAdminGuard)
@ApiBearerAuth()
export class AuditController {
  constructor(private audit: AuditService) {}

  @Get()
  @ApiOperation({ summary: '[SUPERADMIN] Journal des actions du back-office' })
  list(@Query() query: AuditQueryDto) {
    return this.audit.list(query)
  }
}

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([AuditLog])],
  controllers: [AuditController],
  providers: [AuditService, { provide: APP_INTERCEPTOR, useClass: AuditInterceptor }],
  exports: [AuditService],
})
export class AuditModule {}
