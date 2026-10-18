import {
  Controller, Post, Query, UploadedFile, UseGuards, UseInterceptors, BadRequestException, ForbiddenException,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes, ApiBody, ApiQuery } from '@nestjs/swagger'
import { CloudinaryService } from './cloudinary.service'
import {
  UploadedFileData, IMAGE_FILE_KINDS, MAX_IMAGE_FILE_SIZE, MAX_PRINT_FILE_SIZE, extensionFilter, validateUploadedFile,
} from './file-validation'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { AdminGuard } from '../../common/guards/admin.guard'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { isManager } from '../users/user.entity'

// Dossiers du back-office : l'atelier (staff) ne dépose que des BAT, le catalogue et le blog sont réservés aux gestionnaires.
// Images JPG/PNG de 10 Mo max ; un BAT peut aussi être un PDF, jusqu'à 50 Mo comme les fichiers d'impression.
const FOLDERS: Record<string, { managersOnly: boolean; kinds: ('jpg' | 'png' | 'pdf')[]; maxSize: number }> = {
  products: { managersOnly: true,  kinds: ['jpg', 'png'],        maxSize: MAX_IMAGE_FILE_SIZE },
  blog:     { managersOnly: true,  kinds: ['jpg', 'png'],        maxSize: MAX_IMAGE_FILE_SIZE },
  bat:      { managersOnly: false, kinds: ['jpg', 'png', 'pdf'], maxSize: MAX_PRINT_FILE_SIZE },
}

/**
 * Envoi d'images depuis l'admin, signé côté API : remplace l'envoi direct du navigateur vers Cloudinary
 * avec un preset non signé (utilisable par n'importe qui connaissant son nom).
 */
@ApiTags('Fichiers')
@Controller('admin/media')
export class MediaController {
  constructor(private cloudinary: CloudinaryService) {}

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file', {
    limits:     { fileSize: MAX_PRINT_FILE_SIZE, files: 1 },
    fileFilter: extensionFilter([...IMAGE_FILE_KINDS, 'pdf']),
  }))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  @ApiQuery({ name: 'folder', enum: Object.keys(FOLDERS) })
  @ApiOperation({ summary: '[BACK-OFFICE] Envoyer une image (produit, blog : JPG/PNG 10 Mo) ou un BAT (JPG/PNG/PDF 50 Mo)' })
  async upload(@UploadedFile() file: UploadedFileData, @Query('folder') folder: string, @CurrentUser() user) {
    const rule = FOLDERS[folder]
    if (!rule) throw new BadRequestException(`Dossier invalide (${Object.keys(FOLDERS).join(', ')})`)
    if (rule.managersOnly && !isManager(user?.role)) {
      throw new ForbiddenException('Réservé aux administrateurs')
    }
    const resourceType = validateUploadedFile(file, rule.kinds)
    if (file.size > rule.maxSize) {
      throw new BadRequestException(`Fichier trop lourd (${Math.round(rule.maxSize / 1024 / 1024)} Mo maximum)`)
    }
    const result = await this.cloudinary.upload(file.buffer, {
      folder: `yopoeprint/${folder}`,
      filename: file.originalname,
      resourceType,
    })
    return { url: result.url, size: result.bytes, format: result.format }
  }
}
