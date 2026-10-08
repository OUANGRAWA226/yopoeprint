import { registerAs } from '@nestjs/config'

// ─── App Config ───────────────────────────────────────────────
export const appConfig = registerAs('app', () => ({
  nodeEnv:   process.env.NODE_ENV || 'development',
  port:      parseInt(process.env.PORT, 10) || 3001,
  prefix:    process.env.API_PREFIX || 'api/v1',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
}))

// ─── Database Config ──────────────────────────────────────────
export const databaseConfig = registerAs('database', () => ({
  host:     process.env.DB_HOST,
  port:     parseInt(process.env.DB_PORT, 10) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD,
  name:     process.env.DB_NAME || 'postgres',
  ssl:      process.env.DB_SSL === 'true',
}))

// ─── JWT Config ───────────────────────────────────────────────
export const jwtConfig = registerAs('jwt', () => ({
  secret:         process.env.JWT_SECRET,
  expiresIn:      process.env.JWT_EXPIRES_IN || '7d',
  refreshSecret:  process.env.JWT_REFRESH_SECRET,
  refreshExpires: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
}))

// ─── CinetPay Config ──────────────────────────────────────────
export const cinetpayConfig = registerAs('cinetpay', () => ({
  apiKey:    process.env.CINETPAY_API_KEY,
  siteId:    process.env.CINETPAY_SITE_ID,
  secretKey: process.env.CINETPAY_SECRET_KEY,
  baseUrl:   process.env.CINETPAY_BASE_URL || 'https://api-checkout.cinetpay.com/v2',
}))

// ─── Cloudinary Config ────────────────────────────────────────
export const cloudinaryConfig = registerAs('cloudinary', () => ({
  cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  apiKey:    process.env.CLOUDINARY_API_KEY,
  apiSecret: process.env.CLOUDINARY_API_SECRET,
}))

// ─── Email Config ─────────────────────────────────────────────
export const emailConfig = registerAs('email', () => ({
  resendApiKey: process.env.RESEND_API_KEY,
  from:         process.env.EMAIL_FROM || 'noreply@yopoeprint.bf',
}))
