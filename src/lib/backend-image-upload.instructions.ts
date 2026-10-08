// ─────────────────────────────────────────────────────────────
// À ajouter dans votre backend NestJS
// Fichier : src/products/products.controller.ts (extrait)
// ─────────────────────────────────────────────────────────────
//
// 1. Installez multer et cloudinary :
// npm install multer @nestjs/platform-express cloudinary
// npm install -D @types/multer
//
// 2. Ajoutez ces variables dans votre .env :
// CLOUDINARY_CLOUD_NAME=your-cloud-name
// CLOUDINARY_API_KEY=your-api-key
// CLOUDINARY_API_SECRET=your-api-secret

// ── cloudinary.config.ts ──────────────────────────────────────
/*
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
 cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
 api_key: process.env.CLOUDINARY_API_KEY,
 api_secret: process.env.CLOUDINARY_API_SECRET,
})

export { cloudinary }
*/

// ── Ajout dans ProductsController ────────────────────────────
/*
import {
 Controller, Post, Patch, Param, UploadedFile,
 UseInterceptors, BadRequestException
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { memoryStorage } from 'multer'
import { cloudinary } from './cloudinary.config'
import { ProductsService } from './products.service'

@Controller('products')
export class ProductsController {

 // ... vos endpoints existants ...

 // POST /products/:id/image
 @Post(':id/image')
 @UseInterceptors(FileInterceptor('image', {
 storage: memoryStorage(),
 limits: { fileSize: 5 * 1024 * 1024 }, // 5 Mo max
 fileFilter: (_, file, cb) => {
 const allowed = ['image/jpeg', 'image/png', 'image/webp']
 if (allowed.includes(file.mimetype)) cb(null, true)
 else cb(new BadRequestException('Format non supporté. Utilisez JPG, PNG ou WebP.'), false)
 },
 }))
 async uploadImage(
 @Param('id') id: string,
 @UploadedFile() file: Express.Multer.File,
 ) {
 if (!file) throw new BadRequestException('Aucun fichier fourni')

 // Upload vers Cloudinary
 const result = await new Promise<any>((resolve, reject) => {
 cloudinary.uploader.upload_stream(
 {
 folder: 'yopoeprint/products',
 public_id: `product_${id}_${Date.now()}`,
 transformation: [{ width: 800, height: 600, crop: 'limit', quality: 'auto' }],
 },
 (error, result) => {
 if (error) reject(error)
 else resolve(result)
 }
 ).end(file.buffer)
 })

 // Mettre à jour imageUrl en base
 const updated = await this.productsService.update(id, { imageUrl: result.secure_url })
 return { imageUrl: result.secure_url, product: updated }
 }
}
*/

// ─────────────────────────────────────────────────────────────
// ALTERNATIVE SIMPLE (si vous n'avez pas encore Cloudinary) :
// Upload direct depuis le frontend sans passer par le backend.
//
// Dans votre .env.local Next.js :
// NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
// NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=yopoeprint_products
//
// Sur Cloudinary dashboard :
// Settings → Upload → Add upload preset
// Mode: Unsigned
// Folder: yopoeprint/products
// ─────────────────────────────────────────────────────────────

export {}
