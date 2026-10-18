import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from '../users/user.entity'
import { Order } from '../orders/order.entity'
import { MailModule } from '../mail/mail.module'
import { ResellerService } from './reseller.service'
import { ResellerController, AdminResellerController } from './reseller.controller'

@Module({
  imports: [TypeOrmModule.forFeature([User, Order]), MailModule],
  controllers: [ResellerController, AdminResellerController],
  providers: [ResellerService],
  exports: [ResellerService],
})
export class ResellerModule {}
