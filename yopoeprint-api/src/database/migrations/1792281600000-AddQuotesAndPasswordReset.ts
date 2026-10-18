import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddQuotesAndPasswordReset1792281600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // ── Mot de passe oublié ──
    await queryRunner.query(`
      ALTER TABLE "users"
        ADD COLUMN IF NOT EXISTS "password_reset_token_hash" varchar NULL,
        ADD COLUMN IF NOT EXISTS "password_reset_expires_at" timestamptz NULL
    `)

    // ── Demandes de devis ──
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "quote_status" AS ENUM ('new', 'processing', 'sent', 'accepted', 'rejected');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$
    `)

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "quotes" (
        "id"          uuid         NOT NULL DEFAULT gen_random_uuid(),
        "reference"   varchar      NOT NULL,
        "user_id"     uuid         NULL,
        "full_name"   varchar      NOT NULL,
        "email"       varchar      NOT NULL,
        "phone"       varchar      NOT NULL,
        "company"     varchar      NULL,
        "profile"     varchar      NOT NULL,
        "product"     varchar      NOT NULL,
        "quantity"    varchar      NOT NULL,
        "format"      varchar      NULL,
        "description" text         NOT NULL,
        "budget"      varchar      NOT NULL,
        "deadline"    varchar      NOT NULL,
        "has_file"    boolean      NOT NULL DEFAULT false,
        "file_desc"   text         NULL,
        "files"       jsonb        NOT NULL DEFAULT '[]',
        "status"      "quote_status" NOT NULL DEFAULT 'new',
        "price"       integer      NULL,
        "admin_notes" text         NULL,
        "created_at"  timestamp    NOT NULL DEFAULT now(),
        "updated_at"  timestamp    NOT NULL DEFAULT now(),
        CONSTRAINT "PK_quotes_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_quotes_reference" UNIQUE ("reference"),
        CONSTRAINT "FK_quotes_user_id" FOREIGN KEY ("user_id")
          REFERENCES "users"("id") ON DELETE SET NULL
      )
    `)
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_quotes_user_id" ON "quotes" ("user_id")`)
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_quotes_status" ON "quotes" ("status")`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "quotes"`)
    await queryRunner.query(`DROP TYPE IF EXISTS "quote_status"`)
    await queryRunner.query(`
      ALTER TABLE "users"
        DROP COLUMN IF EXISTS "password_reset_expires_at",
        DROP COLUMN IF EXISTS "password_reset_token_hash"
    `)
  }
}
