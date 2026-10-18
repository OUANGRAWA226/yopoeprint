import {
  Injectable, Logger, BadGatewayException, ServiceUnavailableException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createHash } from 'crypto'

export type CloudinaryResourceType = 'image' | 'raw'

export interface CloudinaryUploadResult {
  url:      string
  publicId: string
  bytes:    number
  format?:  string
}

/**
 * Upload signé vers Cloudinary via l'API REST (pas de SDK : une seule requête multipart).
 * Les secrets restent côté API ; le front n'a plus besoin d'un preset "unsigned".
 */
@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name)

  constructor(private configService: ConfigService) {}

  async upload(
    buffer: Buffer,
    options: { folder: string; filename: string; resourceType: CloudinaryResourceType },
  ): Promise<CloudinaryUploadResult> {
    const cloudName = this.configService.get<string>('cloudinary.cloudName')
    const apiKey    = this.configService.get<string>('cloudinary.apiKey')
    const apiSecret = this.configService.get<string>('cloudinary.apiSecret')

    if (!cloudName || !apiKey || !apiSecret) {
      this.logger.error('Cloudinary non configuré (CLOUDINARY_CLOUD_NAME / API_KEY / API_SECRET)')
      throw new ServiceUnavailableException("Le service d'envoi de fichiers est indisponible")
    }

    // Paramètres signés (ordre alphabétique, cf. doc Cloudinary "Generating authentication signatures")
    const params: Record<string, string> = {
      folder:          options.folder,
      timestamp:       String(Math.floor(Date.now() / 1000)),
      unique_filename: 'true',
      use_filename:    'true',
    }
    const toSign = Object.keys(params).sort().map((k) => `${k}=${params[k]}`).join('&')
    const signature = createHash('sha1').update(toSign + apiSecret).digest('hex')

    const form = new FormData()
    form.append('file', new Blob([new Uint8Array(buffer)]), options.filename)
    for (const [k, v] of Object.entries(params)) form.append(k, v)
    form.append('api_key', apiKey)
    form.append('signature', signature)

    const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/${options.resourceType}/upload`

    let res: Response
    try {
      res = await fetch(endpoint, { method: 'POST', body: form })
    } catch (err: any) {
      this.logger.error(`Cloudinary injoignable : ${err?.message || err}`)
      throw new BadGatewayException("Échec de l'envoi du fichier, réessayez dans un instant")
    }

    const body: any = await res.json().catch(() => ({}))
    if (!res.ok || !body?.secure_url) {
      this.logger.error(`Cloudinary a refusé l'upload (${res.status}) : ${body?.error?.message || 'réponse invalide'}`)
      throw new BadGatewayException("Échec de l'envoi du fichier, réessayez dans un instant")
    }

    return {
      url:      body.secure_url,
      publicId: body.public_id,
      bytes:    body.bytes,
      format:   body.format,
    }
  }
}
