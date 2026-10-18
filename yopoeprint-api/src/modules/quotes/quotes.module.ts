import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Quote } from './quote.entity'
import { QuotesService } from './quotes.service'
import { QuotesController } from './quotes.controller'
import { MailModule } from '../mail/mail.module'

@Module({
  imports:     [TypeOrmModule.forFeature([Quote]), MailModule],
  controllers: [QuotesController],
  providers:   [QuotesService],
})
export class QuotesModule {}
