import {
  Controller, Get, Post, Put, Patch, Delete,
  Body, Param, Query, UseGuards, UseInterceptors, UploadedFile,
  HttpCode, HttpStatus, ParseUUIDPipe,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger'
import { ProductsService } from './products.service'
import {
  CreateProductDto, UpdateProductDto, PatchProductDto,
  ProductQueryDto, CalculatePriceDto,
} from './product.dto'
import { JwtAuthGuard }         from '../../common/guards/jwt-auth.guard'
import { OptionalJwtAuthGuard } from '../../common/guards/optional-jwt-auth.guard'
import { AdminGuard }           from '../../common/guards/admin.guard'
import { CurrentUser }          from '../../common/decorators/current-user.decorator'
import { UserRole }             from '../users/user.entity'
import { CloudinaryService }    from '../upload/cloudinary.service'
import {
  UploadedFileData, MAX_IMAGE_FILE_SIZE, IMAGE_FILE_KINDS,
  extensionFilter, validateUploadedFile,
} from '../upload/file-validation'

@ApiTags('Produits')
@Controller('products')
export class ProductsController {
  constructor(
    private productsService: ProductsService,
    private cloudinary: CloudinaryService,
  ) {}

  // ── Public routes ──────────────────────────────────────────

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Lister tous les produits (filtrage possible)' })
  findAll(@Query() query: ProductQueryDto, @CurrentUser() user) {
    const isStaff = user?.role === UserRole.ADMIN || user?.role === UserRole.STAFF
    return this.productsService.findAll(query, isStaff && query.includeInactive === 'true')
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

  @Patch(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[ADMIN] Modifier partiellement un produit (dont active / isActive)' })
  patch(@Param('id', ParseUUIDPipe) id: string, @Body() dto: PatchProductDto) {
    return this.productsService.patch(id, dto)
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[ADMIN] Retirer un produit du catalogue (désactivation douce)' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.softDelete(id)
  }

  @Post(':id/image')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('image', {
    limits:     { fileSize: MAX_IMAGE_FILE_SIZE, files: 1 },
    fileFilter: extensionFilter(IMAGE_FILE_KINDS),
  }))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { image: { type: 'string', format: 'binary' } } } })
  @ApiOperation({ summary: "[ADMIN] Envoyer l'image principale d'un produit (JPG/PNG, 10 Mo max)" })
  async uploadImage(@Param('id', ParseUUIDPipe) id: string, @UploadedFile() file: UploadedFileData) {
    await this.productsService.findById(id) // 404 avant d'envoyer quoi que ce soit à Cloudinary
    const resourceType = validateUploadedFile(file, IMAGE_FILE_KINDS)
    const result = await this.cloudinary.upload(file.buffer, {
      folder:   'yopoeprint/products',
      filename: file.originalname,
      resourceType,
    })
    return this.productsService.setImage(id, result.url)
  }

  @Patch(':id/toggle')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[ADMIN] Activer/Désactiver un produit' })
  toggle(@Param('id') id: string) {
    return this.productsService.toggleActive(id)
  }
}
