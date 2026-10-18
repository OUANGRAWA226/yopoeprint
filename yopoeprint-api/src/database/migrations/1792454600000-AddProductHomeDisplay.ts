import { MigrationInterface, QueryRunner } from 'typeorm'

// Mise en avant des produits sur l'accueil (offres de l'atelier, calculateur), pilotée depuis l'admin
export class AddProductHomeDisplay1792454600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "is_home_offer" boolean NOT NULL DEFAULT false`)
    await queryRunner.query(`ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "in_calculator" boolean NOT NULL DEFAULT false`)
    await queryRunner.query(`ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "offer_quantity" int NULL`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN IF EXISTS "offer_quantity"`)
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN IF EXISTS "in_calculator"`)
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN IF EXISTS "is_home_offer"`)
  }
}
