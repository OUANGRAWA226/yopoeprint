import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddResellerProgram1792368000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Nouveau rôle (Postgres ≥ 12 : ADD VALUE accepté dans une transaction tant qu'il n'est pas utilisé dans la même)
    await queryRunner.query(`ALTER TYPE "users_role_enum" ADD VALUE IF NOT EXISTS 'reseller'`)

    await queryRunner.query(`
      ALTER TABLE "users"
        ADD COLUMN IF NOT EXISTS "company_name" varchar NULL,
        ADD COLUMN IF NOT EXISTS "reseller_status" varchar(20) NULL,
        ADD COLUMN IF NOT EXISTS "reseller_applied_at" timestamptz NULL,
        ADD COLUMN IF NOT EXISTS "reseller_profile" jsonb NULL
    `)

    await queryRunner.query(`
      ALTER TABLE "orders"
        ADD COLUMN IF NOT EXISTS "white_label" boolean NOT NULL DEFAULT false,
        ADD COLUMN IF NOT EXISTS "white_label_sender" jsonb NULL
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Les revendeurs redeviennent clients ; Postgres ne permet pas de retirer une valeur d'enum
    await queryRunner.query(`UPDATE "users" SET "role" = 'client' WHERE "role" = 'reseller'`)
    await queryRunner.query(`
      ALTER TABLE "orders"
        DROP COLUMN IF EXISTS "white_label_sender",
        DROP COLUMN IF EXISTS "white_label"
    `)
    await queryRunner.query(`
      ALTER TABLE "users"
        DROP COLUMN IF EXISTS "reseller_profile",
        DROP COLUMN IF EXISTS "reseller_applied_at",
        DROP COLUMN IF EXISTS "reseller_status",
        DROP COLUMN IF EXISTS "company_name"
    `)
  }
}
