import { MigrationInterface, QueryRunner } from 'typeorm'

// Inscription : date d'acceptation des CGV ; index pour les recherches d'email insensibles à la casse
export class AddTermsAcceptedAt1792455000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "terms_accepted_at" timestamptz NULL`)
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_users_email_lower" ON "users" (LOWER("email"))`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_users_email_lower"`)
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "terms_accepted_at"`)
  }
}
