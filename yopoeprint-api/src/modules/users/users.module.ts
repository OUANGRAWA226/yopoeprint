import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from './user.entity'
import { Order } from '../orders/order.entity'
import { AdminUsersController, TeamController } from './users.controller'
import { MeController } from './me.controller'
import { UsersService } from './users.service'
import { SessionsModule } from '../sessions/sessions.module'

@Module({
  imports: [TypeOrmModule.forFeature([User, Order]), SessionsModule],
  controllers: [MeController, AdminUsersController, TeamController],
  providers: [UsersService],
  exports: [TypeOrmModule, UsersService],
})
export class UsersModule {}
