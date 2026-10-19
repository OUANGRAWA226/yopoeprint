import { MigrationInterface, QueryRunner } from 'typeorm'

// Journaux de supervision : paiements (rapprochement CinetPay, encaissements manuels) et emails transactionnels
export class AddPaymentAndEmailLogs1792454900000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "payment_events" (
        "id"             uuid          NOT NULL DEFAULT gen_random_uuid(),
        "order_id"       uuid          NULL,
        "order_number"   varchar(40)   NULL,
        "transaction_id" varchar(64)   NULL,
        "type"           varchar(30)   NOT NULL,
        "source"         varchar(12)   NOT NULL,
        "amount"         int           NULL,
        "message"        varchar(255)  NULL,
        "actor_email"    varchar       NULL,
        "created_at"     timestamp     NOT NULL DEFAULT now(),
        CONSTRAINT "PK_payment_events_id" PRIMARY KEY ("id")
      )
    `)
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_payment_events_order_id" ON "payment_events" ("order_id")`)
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_payment_events_type" ON "payment_events" ("type")`)
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_payment_events_created_at" ON "payment_events" ("created_at")`)

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "email_logs" (
        "id"          uuid          NOT NULL DEFAULT gen_random_uuid(),
        "to_email"    varchar       NOT NULL,
        "subject"     varchar(200)  NOT NULL,
        "template"    varchar(40)   NOT NULL,
        "status"      varchar(12)   NOT NULL,
        "provider_id" varchar       NULL,
        "error"       varchar(300)  NULL,
        "created_at"  timestamp     NOT NULL DEFAULT now(),
        CONSTRAINT "PK_email_logs_id" PRIMARY KEY ("id")
      )
    `)
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_email_logs_template" ON "email_logs" ("template")`)
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_email_logs_status" ON "email_logs" ("status")`)
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_email_logs_created_at" ON "email_logs" ("created_at")`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "email_logs"`)
    await queryRunner.query(`DROP TABLE IF EXISTS "payment_events"`)
  }
}
