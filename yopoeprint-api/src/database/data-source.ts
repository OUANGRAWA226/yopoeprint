import { DataSource } from 'typeorm'
import { config } from 'dotenv'

config()

export const AppDataSource = new DataSource({
  type:        'postgres',
  host:        process.env.DB_HOST,
  port:        parseInt(process.env.DB_PORT, 10) || 5432,
  username:    process.env.DB_USERNAME || 'postgres',
  password:    process.env.DB_PASSWORD,
  database:    process.env.DB_NAME || 'postgres',
  ssl:         process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  entities:    [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations:  [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: false, // NE JAMAIS mettre true en production
  // Une transaction par migration : une valeur d'enum ajoutée par une migration
  // n'est utilisable qu'après validation de sa transaction (Postgres)
  migrationsTransactionMode: 'each',
  logging:     process.env.NODE_ENV === 'development',
})
