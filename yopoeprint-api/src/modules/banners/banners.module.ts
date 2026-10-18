import {
  Controller, Get, Post, Patch, Put, Delete, Body, Param, Query, UseGuards, UseInterceptors, UploadedFile,
  ParseUUIDPipe, BadRequestException, Module,
} from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes, ApiBody, ApiQuery } from '@nestjs/swagger'
import { Banner } from './banner.entity'
import { BannersService } from './banners.service'
import { CreateBannerDto, UpdateBannerDto, ReorderBannersDto, BANNER_FORMATS, BannerVariant } from './banner.dto'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { ManagerGuard } from '../../common/guards/admin.guard'
import { Audit } from '../audit/audit.decorator'
import { UploadModule } from '../upload/upload.module'
import { UploadedFileData, extensionFilter, IMAGE_FILE_KINDS, MAX_IMAGE_FILE_SIZE } from '../upload/file-validation'

@ApiTags('Bannières')
@Controller()
export class BannersController {
  constructor(private banners: BannersService) {}

  @Get('banners')
  @ApiOperation({ summary: 'Bannières du carrousel actuellement diffusées (actives et dans leur période)' })
  listPublic() {
    return this.banners.listPublic()
  }

  @Get('admin/banners')
  @UseGuards(JwtAuthGuard, ManagerGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[ADMIN] Toutes les bannières, y compris inactives ou programmées' })
  listAll() {
    return this.banners.listAll()
  }

  @Post('admin/banners/image')
  @UseGuards(JwtAuthGuard, ManagerGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('image', {
    limits:     { fileSize: MAX_IMAGE_FILE_SIZE, files: 1 },
    fileFilter: extensionFilter(IMAGE_FILE_KINDS),
  }))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { image: { type: 'string', format: 'binary' } } } })
  @ApiQuery({ name: 'variant', enum: Object.keys(BANNER_FORMATS) })
  @ApiOperation({ summary: '[ADMIN] Envoyer un visuel (ordinateur 1248 × 357 px, téléphone 660 × 330 px, JPG/PNG)' })
  uploadImage(@UploadedFile() file: UploadedFileData, @Query('variant') variant: string) {
    if (!(variant in BANNER_FORMATS)) throw new BadRequestException('Variante invalide (desktop ou mobile)')
    return this.banners.uploadImage(file, variant as BannerVariant)
  }

  @Post('admin/banners')
  @UseGuards(JwtAuthGuard, ManagerGuard)
  @Audit('banner.create', 'banner')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[ADMIN] Créer une bannière' })
  create(@Body() dto: CreateBannerDto) {
    return this.banners.create(dto)
  }

  // Déclarée avant ':id' pour ne pas être capturée par la route paramétrée
  @Put('admin/banners/order')
  @UseGuards(JwtAuthGuard, ManagerGuard)
  @Audit('banner.order', 'banner')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[ADMIN] Réordonner le carrousel' })
  reorder(@Body() dto: ReorderBannersDto) {
    return this.banners.reorder(dto.ids)
  }

  @Patch('admin/banners/:id')
  @UseGuards(JwtAuthGuard, ManagerGuard)
  @Audit('banner.update', 'banner')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[ADMIN] Modifier une bannière (contenu, visuels, activation, période)' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateBannerDto) {
    return this.banners.update(id, dto)
  }

  @Delete('admin/banners/:id')
  @UseGuards(JwtAuthGuard, ManagerGuard)
  @Audit('banner.delete', 'banner')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[ADMIN] Supprimer une bannière' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.banners.remove(id)
  }
}

@Module({
  imports: [TypeOrmModule.forFeature([Banner]), UploadModule],
  controllers: [BannersController],
  providers: [BannersService],
})
export class BannersModule {}
