import { MigrationInterface, QueryRunner } from 'typeorm'

// Inscription en 3 étapes : date de naissance du client (étape 3)
export class AddBirthDate1792455100000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "birth_date" date NULL`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "birth_date"`)
  }
}
