import {
  Controller, Get, Post, Patch,
  Body, Param, Query, UseGuards, ParseUUIDPipe,
} from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { Throttle } from '@nestjs/throttler'
import { QuotesService } from './quotes.service'
import { CreateQuoteDto, UpdateQuoteStatusDto, QuoteQueryDto } from './quote.dto'
import { JwtAuthGuard }         from '../../common/guards/jwt-auth.guard'
import { OptionalJwtAuthGuard } from '../../common/guards/optional-jwt-auth.guard'
import { AdminGuard }           from '../../common/guards/admin.guard'
import { CurrentUser }          from '../../common/decorators/current-user.decorator'
import { Audit }                from '../audit/audit.decorator'

@ApiTags('Devis')
@Controller('quotes')
export class QuotesController {
  constructor(private quotesService: QuotesService) {}

  // ── Public (rattaché au compte si un token valide est envoyé) ──
  @Post()
  @UseGuards(OptionalJwtAuthGuard)
  @Throttle({ default: { limit: 5, ttl: 10 * 60_000 } }) // 5 demandes / 10 min / IP
  @ApiOperation({ summary: 'Demander un devis sur mesure (connexion facultative)' })
  create(@Body() dto: CreateQuoteDto, @CurrentUser() user) {
    return this.quotesService.create(dto, user?.id ?? null)
  }

  // ── Client ─────────────────────────────────────────────────
  @Get('my-quotes')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mes demandes de devis' })
  myQuotes(@CurrentUser() user) {
    return this.quotesService.findByUser(user.id)
  }

  // ── Admin ──────────────────────────────────────────────────
  @Get()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[ADMIN] Lister les demandes de devis' })
  findAll(@Query() query: QuoteQueryDto) {
    return this.quotesService.findAll(query)
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "[ADMIN] Détail d'une demande de devis" })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.quotesService.findOne(id)
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @Audit('quote.status', 'quote')
  @ApiOperation({ summary: '[ADMIN] Changer le statut / chiffrer un devis' })
  updateStatus(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateQuoteStatusDto) {
    return this.quotesService.updateStatus(id, dto)
  }
}
