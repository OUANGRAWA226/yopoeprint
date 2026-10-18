import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ProductsService }    from './products.service'
import { ProductsController } from './products.controller'
import { Product }            from './product.entity'
import { UploadModule }       from '../upload/upload.module'

@Module({
  imports:     [TypeOrmModule.forFeature([Product]), UploadModule],
  controllers: [ProductsController],
  providers:   [ProductsService],
  exports:     [ProductsService],
})
export class ProductsModule {}
