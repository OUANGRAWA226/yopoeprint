import { Module } from '@nestjs/common'
import { TypeOrmModule }  from '@nestjs/typeorm'
import { OrdersService }    from './orders.service'
import { OrdersController } from './orders.controller'
import { Order }            from './order.entity'
import { Quote }            from '../quotes/quote.entity'
import { ProductsModule }   from '../products/products.module'
import { UsersModule }      from '../users/users.module'
import { MailModule }       from '../mail/mail.module'
import { ResellerModule }   from '../reseller/reseller.module'

@Module({
  imports:     [TypeOrmModule.forFeature([Order, Quote]), ProductsModule, UsersModule, MailModule, ResellerModule],
  controllers: [OrdersController],
  providers:   [OrdersService],
  exports:     [OrdersService],
})
export class OrdersModule {}
