import { BadRequestException } from '@nestjs/common'
import { extname } from 'path'
import { CloudinaryResourceType } from './cloudinary.service'

// Fichier tel que fourni par multer (memoryStorage) — évite une dépendance à @types/multer
export interface UploadedFileData {
  originalname: string
  mimetype:     string
  size:         number
  buffer:       Buffer
}

export const MAX_PRINT_FILE_SIZE = 50 * 1024 * 1024  // 50 Mo
export const MAX_IMAGE_FILE_SIZE = 10 * 1024 * 1024  // 10 Mo (visuels produits)

type Kind = 'pdf' | 'ai' | 'psd' | 'jpg' | 'png' | 'tiff'

const EXTENSIONS: Record<string, Kind> = {
  '.pdf': 'pdf', '.ai': 'ai', '.psd': 'psd',
  '.jpg': 'jpg', '.jpeg': 'jpg', '.png': 'png',
  '.tif': 'tiff', '.tiff': 'tiff',
}

const startsWith = (buf: Buffer, bytes: number[]) =>
  buf.length >= bytes.length && bytes.every((b, i) => buf[i] === b)
const startsWithText = (buf: Buffer, text: string) =>
  buf.subarray(0, text.length).toString('latin1') === text

// Signature binaire attendue pour chaque type : on ne fait pas confiance au seul nom/mimetype
const MAGIC: Record<Kind, (buf: Buffer) => boolean> = {
  pdf:  (b) => startsWithText(b, '%PDF'),
  ai:   (b) => startsWithText(b, '%PDF') || startsWithText(b, '%!PS'), // AI moderne = PDF, ancien = PostScript
  psd:  (b) => startsWithText(b, '8BPS'),
  jpg:  (b) => startsWith(b, [0xff, 0xd8, 0xff]),
  png:  (b) => startsWith(b, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  tiff: (b) => startsWith(b, [0x49, 0x49, 0x2a, 0x00]) || startsWith(b, [0x4d, 0x4d, 0x00, 0x2a]),
}

export const PRINT_FILE_KINDS: Kind[] = ['pdf', 'ai', 'psd', 'jpg', 'png', 'tiff']
export const IMAGE_FILE_KINDS: Kind[] = ['jpg', 'png']

/** Filtre multer : rejette tôt (avant lecture complète) les extensions non autorisées. */
export function extensionFilter(allowed: Kind[]) {
  return (_req: any, file: { originalname: string }, cb: (err: Error | null, accept: boolean) => void) => {
    const kind = EXTENSIONS[extname(file.originalname || '').toLowerCase()]
    if (!kind || !allowed.includes(kind)) {
      return cb(new BadRequestException(`Format non accepté. Formats autorisés : ${allowed.join(', ').toUpperCase()}`), false)
    }
    cb(null, true)
  }
}

/** Vérifie la présence du fichier et sa signature binaire ; renvoie le type Cloudinary adapté. */
export function validateUploadedFile(file: UploadedFileData | undefined, allowed: Kind[]): CloudinaryResourceType {
  if (!file?.buffer?.length) {
    throw new BadRequestException('Aucun fichier reçu (champ "file" manquant ou vide)')
  }
  const kind = EXTENSIONS[extname(file.originalname || '').toLowerCase()]
  if (!kind || !allowed.includes(kind) || !MAGIC[kind](file.buffer)) {
    throw new BadRequestException('Le contenu du fichier ne correspond pas à son extension')
  }
  // JPG/PNG → "image" (aperçus, transformations). PDF/AI/PSD/TIFF → "raw" : fichier livré tel quel
  // à l'atelier, sans conversion ni la restriction de diffusion des PDF des comptes Cloudinary gratuits.
  return kind === 'jpg' || kind === 'png' ? 'image' : 'raw'
}
