import { MigrationInterface, QueryRunner } from 'typeorm'

// Codes promo gérés depuis l'admin. Les 4 codes jusqu'ici codés en dur sont repris à l'identique
// (sans limite, sans minimum) pour ne pas couper les clients qui les connaissent ; YOPPRINT15 reste mis en avant.
export class AddPromoCodes1792454700000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "promo_codes" (
        "id"                uuid          NOT NULL DEFAULT gen_random_uuid(),
        "code"              varchar(30)   NOT NULL,
        "type"              varchar(12)   NOT NULL,
        "value"             int           NOT NULL,
        "min_order"         int           NOT NULL DEFAULT 0,
        "max_uses"          int           NULL,
        "once_per_customer" boolean       NOT NULL DEFAULT false,
        "description"       varchar(120)  NULL,
        "is_active"         boolean       NOT NULL DEFAULT true,
        "is_featured"       boolean       NOT NULL DEFAULT false,
        "starts_at"         timestamptz   NULL,
        "ends_at"           timestamptz   NULL,
        "created_at"        timestamp     NOT NULL DEFAULT now(),
        "updated_at"        timestamp     NOT NULL DEFAULT now(),
        CONSTRAINT "PK_promo_codes_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_promo_codes_code" UNIQUE ("code")
      )
    `)
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_orders_promo_code" ON "orders" ("promo_code")`)
    await queryRunner.query(`
      INSERT INTO "promo_codes" ("code", "type", "value", "description", "is_featured") VALUES
        ('YOPPRINT15', 'percentage', 15, '−15 % sur votre commande', true),
        ('YOPOE10',    'percentage', 10, '−10 % de bienvenue', false),
        ('BURKINA',    'percentage', 15, '−15 % spécial Burkina Faso', false),
        ('PROMO20',    'percentage', 20, '−20 % de remise exceptionnelle', false)
      ON CONFLICT ("code") DO NOTHING
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_orders_promo_code"`)
    await queryRunner.query(`DROP TABLE IF EXISTS "promo_codes"`)
  }
}
