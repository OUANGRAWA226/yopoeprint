import { Controller, Get, Query, UseGuards, Module } from '@nestjs/common';
import { TypeOrmModule, InjectRepository } from '@nestjs/typeorm';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Repository } from 'typeorm';
import { MailService } from './mail.service';
import { EmailLog } from './email-log.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ManagerGuard } from '../../common/guards/admin.guard';

@ApiTags('Emails')
@Controller('admin/emails')
export class EmailLogsController {
  constructor(@InjectRepository(EmailLog) private logs: Repository<EmailLog>) {}

  @Get()
  @UseGuards(JwtAuthGuard, ManagerGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[ADMIN] Journal des emails envoyés, en échec ou simulés' })
  async list(@Query('status') status?: string, @Query('template') template?: string, @Query('page') pageQ?: string, @Query('limit') limitQ?: string) {
    const page = Math.max(Number(pageQ) || 1, 1);
    const limit = Math.min(Math.max(Number(limitQ) || 50, 1), 200);
    const where: Record<string, string> = {};
    if (status) where.status = status;
    if (template) where.template = template;
    const [data, total] = await this.logs.findAndCount({ where, order: { createdAt: 'DESC' }, skip: (page - 1) * limit, take: limit });
    const since = new Date(Date.now() - 7 * 24 * 3600_000);
    const counts = await this.logs.createQueryBuilder('l')
      .select('l.status', 'status').addSelect('COUNT(*)', 'count')
      .where('l.created_at >= :since', { since }).groupBy('l.status').getRawMany();
    return { data, total, page, limit, last7d: Object.fromEntries(counts.map((c) => [c.status, Number(c.count)])) };
  }
}

@Module({
  imports: [TypeOrmModule.forFeature([EmailLog])],
  controllers: [EmailLogsController],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
