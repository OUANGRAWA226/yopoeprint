import { MigrationInterface, QueryRunner } from 'typeorm'

// Historique des transactions CinetPay par commande : une notification tardive
// d'une tentative précédente retrouve encore sa commande après une relance
export class AddPaymentTransactions1792455200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "payment_transactions" (
        "id"             uuid         NOT NULL DEFAULT gen_random_uuid(),
        "transaction_id" varchar(64)  NOT NULL,
        "order_id"       uuid         NOT NULL,
        "created_at"     timestamp    NOT NULL DEFAULT now(),
        CONSTRAINT "PK_payment_transactions_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_payment_transactions_order_id" FOREIGN KEY ("order_id")
          REFERENCES "orders"("id") ON DELETE CASCADE
      )
    `)
    await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS "UQ_payment_transactions_transaction_id" ON "payment_transactions" ("transaction_id")`)
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_payment_transactions_order_id" ON "payment_transactions" ("order_id")`)

    // Reprise de l'existant : transactions initialisées d'après le journal, puis la transaction courante
    await queryRunner.query(`
      INSERT INTO "payment_transactions" ("transaction_id", "order_id", "created_at")
      SELECT DISTINCT ON (e."transaction_id") e."transaction_id", e."order_id", e."created_at"
      FROM "payment_events" e
      JOIN "orders" o ON o."id" = e."order_id"
      WHERE e."type" = 'init' AND e."transaction_id" IS NOT NULL
      ORDER BY e."transaction_id", e."created_at"
      ON CONFLICT ("transaction_id") DO NOTHING
    `)
    await queryRunner.query(`
      INSERT INTO "payment_transactions" ("transaction_id", "order_id", "created_at")
      SELECT o."payment_transaction_id", o."id", o."updated_at"
      FROM "orders" o
      WHERE o."payment_transaction_id" IS NOT NULL AND o."payment_transaction_id" NOT LIKE 'MANUEL:%'
      ON CONFLICT ("transaction_id") DO NOTHING
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "payment_transactions"`)
  }
}
