import {
  Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, ParseUUIDPipe, HttpCode, HttpStatus, Module,
} from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Throttle } from '@nestjs/throttler'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { PromoCode } from './promo-code.entity'
import { PromosService } from './promos.service'
import { CreatePromoDto, UpdatePromoDto, ValidatePromoDto } from './promo.dto'
import { Order } from '../orders/order.entity'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { OptionalJwtAuthGuard } from '../../common/guards/optional-jwt-auth.guard'
import { ManagerGuard } from '../../common/guards/admin.guard'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { Audit } from '../audit/audit.decorator'

@ApiTags('Codes promo')
@Controller()
export class PromosController {
  constructor(private promos: PromosService) {}

  @Get('promos/featured')
  @ApiOperation({ summary: 'Code promo mis en avant sur la boutique (ou null)' })
  featured() {
    return this.promos.featured()
  }

  // Limité pour éviter de deviner des codes par essais successifs
  @Post('promos/validate')
  @HttpCode(HttpStatus.OK)
  @UseGuards(OptionalJwtAuthGuard)
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @ApiOperation({ summary: 'Vérifier un code depuis le panier (renvoie isValid et la raison)' })
  validate(@Body() dto: ValidatePromoDto, @CurrentUser() user) {
    return this.promos.check(dto.code, dto.orderTotal, user?.id)
  }

  @Get('admin/promos')
  @UseGuards(JwtAuthGuard, ManagerGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[ADMIN] Codes promo et leurs utilisations' })
  list() {
    return this.promos.list()
  }

  @Post('admin/promos')
  @UseGuards(JwtAuthGuard, ManagerGuard)
  @Audit('promo.create', 'promo')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[ADMIN] Créer un code promo' })
  create(@Body() dto: CreatePromoDto) {
    return this.promos.create(dto)
  }

  @Patch('admin/promos/:id')
  @UseGuards(JwtAuthGuard, ManagerGuard)
  @Audit('promo.update', 'promo')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[ADMIN] Modifier un code promo (activation, mise en avant, limites)' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdatePromoDto) {
    return this.promos.update(id, dto)
  }

  @Delete('admin/promos/:id')
  @UseGuards(JwtAuthGuard, ManagerGuard)
  @Audit('promo.delete', 'promo')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[ADMIN] Supprimer un code jamais utilisé' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.promos.remove(id)
  }
}

@Module({
  imports: [TypeOrmModule.forFeature([PromoCode, Order])],
  controllers: [PromosController],
  providers: [PromosService],
  exports: [PromosService],
})
export class PromosModule {}
