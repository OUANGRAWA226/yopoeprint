import {
  Controller, Get, Post, Put, Patch,
  Body, Param, Query, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { ProductsService } from './products.service'
import {
  CreateProductDto, UpdateProductDto,
  ProductQueryDto, CalculatePriceDto,
} from './product.dto'
import { JwtAuthGuard }  from '../../common/guards/jwt-auth.guard'
import { AdminGuard }    from '../../common/guards/admin.guard'

@ApiTags('Produits')
@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  // ── Public routes ──────────────────────────────────────────

  @Get()
  @ApiOperation({ summary: 'Lister tous les produits (filtrage possible)' })
  findAll(@Query() query: ProductQueryDto) {
    return this.productsService.findAll(query)
  }

  @Get('popular')
  @ApiOperation({ summary: 'Produits populaires (page d\'accueil)' })
  findPopular() {
    return this.productsService.findPopular(8)
  }

  @Post('calculate-price')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Calculer le prix selon la configuration' })
  calculatePrice(@Body() dto: CalculatePriceDto) {
    return this.productsService.calculatePrice(dto)
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Obtenir un produit par son slug' })
  findOne(@Param('slug') slug: string) {
    return this.productsService.findBySlug(slug)
  }

  // ── Admin routes ───────────────────────────────────────────

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[ADMIN] Créer un produit' })
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto)
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[ADMIN] Modifier un produit' })
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto)
  }

  @Patch(':id/toggle')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[ADMIN] Activer/Désactiver un produit' })
  toggle(@Param('id') id: string) {
    return this.productsService.toggleActive(id)
  }
}
