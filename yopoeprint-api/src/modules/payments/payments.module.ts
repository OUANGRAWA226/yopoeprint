import { Module } from '@nestjs/common'
import { TypeOrmModule }      from '@nestjs/typeorm'
import { PaymentsService }    from './payments.service'
import { PaymentsController } from './payments.controller'
import { PaymentEvent }       from './payment-event.entity'
import { Order }              from '../orders/order.entity'
import { OrdersModule }       from '../orders/orders.module'

@Module({
  imports:     [TypeOrmModule.forFeature([PaymentEvent, Order]), OrdersModule],
  controllers: [PaymentsController],
  providers:   [PaymentsService],
  exports:     [PaymentsService],
})
export class PaymentsModule {}
