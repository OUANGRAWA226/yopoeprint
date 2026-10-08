import { Module } from '@nestjs/common'
import { TypeOrmModule }  from '@nestjs/typeorm'
import { OrdersService }    from './orders.service'
import { OrdersController } from './orders.controller'
import { Order }            from './order.entity'
import { ProductsModule }   from '../products/products.module'
import { UsersModule }      from '../users/users.module'
import { MailModule }       from '../mail/mail.module'

@Module({
  imports:     [TypeOrmModule.forFeature([Order]), ProductsModule, UsersModule, MailModule],
  controllers: [OrdersController],
  providers:   [OrdersService],
  exports:     [OrdersService],
})
export class OrdersModule {}
