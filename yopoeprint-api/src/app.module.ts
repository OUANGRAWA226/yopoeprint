import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule }  from '@nestjs/typeorm'
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'
import {
  appConfig, databaseConfig, jwtConfig,
  cinetpayConfig, cloudinaryConfig, emailConfig,
} from './config'

// Modules
import { AuthModule }     from './modules/auth/auth.module'
import { UsersModule }    from './modules/users/users.module'
import { ProductsModule } from './modules/products/products.module'
import { OrdersModule }   from './modules/orders/orders.module'
import { PaymentsModule } from './modules/payments/payments.module'
import { MailModule }     from './modules/mail/mail.module'
import { UploadModule }   from './modules/upload/upload.module'
import { QuotesModule }   from './modules/quotes/quotes.module'
import { ResellerModule } from './modules/reseller/reseller.module'

// Entities
import { User }    from './modules/users/user.entity'
import { Product } from './modules/products/product.entity'
import { Order }   from './modules/orders/order.entity'
import { Quote }   from './modules/quotes/quote.entity'

@Module({
  imports: [
    // ── Config ──────────────────────────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, jwtConfig, cinetpayConfig, cloudinaryConfig, emailConfig],
      envFilePath: '.env',
    }),

    // ── Rate Limiting ────────────────────────────────────────
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject:  [ConfigService],
      useFactory: (cs: ConfigService) => [{
        ttl:   cs.get('THROTTLE_TTL', 60) * 1000,
        limit: cs.get('THROTTLE_LIMIT', 100),
      }],
    }),

    // ── Database (Supabase PostgreSQL) ───────────────────────
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject:  [ConfigService],
      useFactory: (cs: ConfigService) => ({
        type:        'postgres',
        host:        cs.get('database.host'),
        port:        cs.get('database.port'),
        username:    cs.get('database.username'),
        password:    cs.get('database.password'),
        database:    cs.get('database.name'),
        ssl:         cs.get('database.ssl') ? { rejectUnauthorized: false } : false,
        entities:    [User, Product, Order, Quote],
        synchronize: cs.get('app.nodeEnv') === 'development', // Auto-create tables in dev
        logging:     cs.get('app.nodeEnv') === 'development',
      }),
    }),

    // ── Feature Modules ──────────────────────────────────────
    AuthModule,
    UsersModule,
    ProductsModule,
    OrdersModule,
    PaymentsModule,
    MailModule,
    UploadModule,
    QuotesModule,
    ResellerModule,
  ],
  providers: [
    // Active le rate limiting global (et les @Throttle par route, ex. login)
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
