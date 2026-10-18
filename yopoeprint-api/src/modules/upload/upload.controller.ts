import {
  Controller, Post, Body, UploadedFile, UseInterceptors, HttpCode, HttpStatus,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger'
import { Throttle } from '@nestjs/throttler'
import { CloudinaryService } from './cloudinary.service'
import {
  UploadedFileData, MAX_PRINT_FILE_SIZE, PRINT_FILE_KINDS,
  extensionFilter, validateUploadedFile,
} from './file-validation'

// Dossiers Cloudinary autorisés (le front envoie "designs", "orders"…) ; tout le reste → "general"
const ALLOWED_FOLDERS = ['designs', 'orders', 'quotes', 'general']

@ApiTags('Fichiers')
@Controller('upload')
export class UploadController {
  constructor(private cloudinary: CloudinaryService) {}

  // Public : la fiche produit envoie le fichier avant la connexion → rate limit strict à la place de l'auth
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ default: { limit: 10, ttl: 10 * 60_000 } }) // 10 fichiers / 10 min / IP
  @UseInterceptors(FileInterceptor('file', {
    limits:     { fileSize: MAX_PRINT_FILE_SIZE, files: 1 },
    fileFilter: extensionFilter(PRINT_FILE_KINDS),
  }))
  @ApiOperation({ summary: "Envoyer un fichier d'impression (PDF, AI, PSD, JPG, PNG, TIFF — 50 Mo max)" })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file:   { type: 'string', format: 'binary' },
        folder: { type: 'string', enum: ALLOWED_FOLDERS },
      },
    },
  })
  async upload(@UploadedFile() file: UploadedFileData, @Body('folder') folder?: string) {
    const resourceType = validateUploadedFile(file, PRINT_FILE_KINDS)
    const safeFolder = ALLOWED_FOLDERS.includes(folder) ? folder : 'general'

    const result = await this.cloudinary.upload(file.buffer, {
      folder:   `yopoeprint/${safeFolder}`,
      filename: file.originalname,
      resourceType,
    })

    return { url: result.url, size: result.bytes, format: result.format }
  }
}
