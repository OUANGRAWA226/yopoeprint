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
  const frontendUrl = config.get('app.frontendUrl') || 'http://localhost:3000'
  const corsOrigins = [
    frontendUrl,
    'http://localhost:3000',  // Frontend client
    'http://localhost:3002',  // Admin dashboard
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3002',
  ]
  
  app.enableCors({
    origin: corsOrigins,
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
