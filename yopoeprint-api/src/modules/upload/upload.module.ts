import { Module } from '@nestjs/common'
import { CloudinaryService } from './cloudinary.service'
import { UploadController } from './upload.controller'
import { MediaController } from './media.controller'

@Module({
  controllers: [UploadController, MediaController],
  providers:   [CloudinaryService],
  exports:     [CloudinaryService],
})
export class UploadModule {}
