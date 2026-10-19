import { NestFactory } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'
import { ValidationPipe, Logger } from '@nestjs/common'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { ConfigService } from '@nestjs/config'
import { AppModule } from './app.module'
import { GlobalExceptionFilter } from './common/filters/global-exception.filter'

async function bootstrap() {
  const app    = await NestFactory.create<NestExpressApplication>(AppModule)
  const config = app.get(ConfigService)
  const logger = new Logger('Bootstrap')

  // ── API Prefix ─────────────────────────────────────────────
  const prefix = config.get('app.prefix') || 'api/v1'
  app.setGlobalPrefix(prefix)

  // ── Reverse proxy (Render) : vraie IP client pour le rate limiting ──
  const trustProxy = config.get<number>('app.trustProxy')
  if (trustProxy) app.set('trust proxy', trustProxy)

  // ── CORS ───────────────────────────────────────────────────
  const isProduction = config.get('app.nodeEnv') === 'production'
  const frontendUrl = config.get<string>('app.frontendUrl') || 'http://localhost:3000'
  const adminUrl    = config.get<string>('app.adminUrl') || 'http://localhost:3002'
  const extraOrigins = config.get<string[]>('app.allowedOrigins') || []
  const productionOrigins = [
    'https://yopoeprint.bf',
    'https://www.yopoeprint.bf',
    'https://admin.yopoeprint.bf',
    'https://yopoeprint.com',
    'https://www.yopoeprint.com',
    'https://admin.yopoeprint.com',
    'https://yopoeprint.vercel.app',
  ]
  const devOrigins = [
    'http://localhost:3000',
    'http://localhost:3002',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3002',
  ]
  const corsOrigins = new Set([
    frontendUrl,
    adminUrl,
    ...extraOrigins,
    ...productionOrigins,
    ...(isProduction ? [] : devOrigins),
  ])

  app.enableCors({
    origin: (origin, callback) => {
      // Requêtes sans header Origin (curl, serveurs, webhook CinetPay) : CORS ne s'applique pas
      if (!origin) return callback(null, true)
      return callback(null, corsOrigins.has(origin))
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    // L'admin (autre origine) lit le nom de fichier des exports CSV
    exposedHeaders: ['Content-Disposition'],
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
