import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { AuthService }    from './auth.service'
import { AuthController } from './auth.controller'
import { JwtStrategy }    from './jwt.strategy'
import { User }           from '../users/user.entity'
import { MailModule }     from '../mail/mail.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    PassportModule,
    MailModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject:  [ConfigService],
      useFactory: (cs: ConfigService) => ({
        secret:      cs.get('jwt.secret'),
        signOptions: { expiresIn: cs.get('jwt.expiresIn') },
      }),
    }),
  ],
  controllers: [AuthController],
  providers:   [AuthService, JwtStrategy],
  exports:     [AuthService],
})
export class AuthModule {}
