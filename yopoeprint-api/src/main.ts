import { NestFactory } from '@nestjs/core'
import { ValidationPipe, Logger } from '@nestjs/common'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { ConfigService } from '@nestjs/config'
import { AppModule } from './app.module'
import { GlobalExceptionFilter } from './common/filters/global-exception.filter'

async function bootstrap() {
  const app    = await NestFactory.create(AppModule)
  const config = app.get(ConfigService)
  const logger = new Logger('Bootstrap')

  // ── API Prefix ─────────────────────────────────────────────
  const prefix = config.get('app.prefix') || 'api/v1'
  app.setGlobalPrefix(prefix)

  // ── CORS ───────────────────────────────────────────────────
  const frontendUrl = config.get<string>('app.frontendUrl') || 'http://localhost:3000'
  const adminUrl    = config.get<string>('app.adminUrl') || 'http://localhost:3002'
  const extraOrigins = config.get<string[]>('app.allowedOrigins') || []
  const corsOrigins = Array.from(new Set([
    frontendUrl,
    adminUrl,
    'http://localhost:3000',
    'http://localhost:3002',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3002',
    ...extraOrigins,
  ]))
  
  app.enableCors({
    origin: (origin, callback) => {
      // Autoriser les requêtes sans header origin (app mobile, curl, serveurs)
      if (!origin) return callback(null, true)
      if (
        corsOrigins.includes(origin) ||
        origin.endsWith('.vercel.app') ||
        origin.includes('yopoeprint') ||
        config.get('app.nodeEnv') !== 'production'
      ) {
        return callback(null, true)
      }
      return callback(null, true)
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  })

  // ── Global Validation ─────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist:        true,   // Strip unknown properties
      forbidNonWhitelisted: false,
      transform:        true,   // Auto-transform types
      transformOptions: { enableImplicitConversion: true },
    }),
  )

  // ── Global Exception Filter ───────────────────────────────
  app.useGlobalFilters(new GlobalExceptionFilter())

  // ── Swagger API Docs ──────────────────────────────────────
  if (config.get('app.nodeEnv') !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('YopoePrint API')
      .setDescription(`
        API Backend de la plateforme YopoePrint — Imprimerie en ligne au Burkina Faso.
        
        **Modules disponibles :**
        - 🔐 Authentification (JWT)
        - 📦 Produits & Catalogue
        - 🛒 Commandes & Panier
        - 💳 Paiements CinetPay (Orange Money, Moov Money, Visa)
      `)
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('Authentification')
      .addTag('Produits')
      .addTag('Commandes')
      .addTag('Paiements')
      .build()

    const document = SwaggerModule.createDocument(app, swaggerConfig)
    SwaggerModule.setup('docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        tagsSorter: 'alpha',
      },
    })

    logger.log(`📚 Swagger docs: http://localhost:${config.get('app.port')}/docs`)
  }

  // ── Start server ──────────────────────────────────────────
  const port = config.get('app.port') || 3001
  await app.listen(port)

  logger.log(`🚀 YopoePrint API running on: http://localhost:${port}/${prefix}`)
  logger.log(`🌍 Environment: ${config.get('app.nodeEnv')}`)
}

bootstrap()
