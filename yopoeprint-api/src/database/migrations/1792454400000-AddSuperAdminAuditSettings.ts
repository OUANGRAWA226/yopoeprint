import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddSuperAdminAuditSettings1792454400000 implements MigrationInterface {
  // La valeur 'superadmin' est ajoutée par la migration précédente (transaction distincte)
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Le plus ancien administrateur actif devient superadmin (sinon personne ne pourrait gérer l'équipe)
    await queryRunner.query(`
      UPDATE "users" SET "role" = 'superadmin'
      WHERE "id" = (
        SELECT "id" FROM "users" WHERE "role" = 'admin' AND "is_active" = true
        ORDER BY "created_at" ASC LIMIT 1
      )
      AND NOT EXISTS (SELECT 1 FROM "users" WHERE "role" = 'superadmin')
    `)

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "audit_logs" (
        "id"          uuid         NOT NULL DEFAULT gen_random_uuid(),
        "actor_id"    uuid         NULL,
        "actor_email" varchar      NULL,
        "actor_role"  varchar(20)  NULL,
        "action"      varchar(80)  NOT NULL,
        "target_type" varchar(40)  NULL,
        "target_id"   varchar(64)  NULL,
        "details"     jsonb        NULL,
        "ip"          varchar(64)  NULL,
        "created_at"  timestamp    NOT NULL DEFAULT now(),
        CONSTRAINT "PK_audit_logs_id" PRIMARY KEY ("id")
      )
    `)
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_audit_logs_actor_id" ON "audit_logs" ("actor_id")`)
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_audit_logs_action" ON "audit_logs" ("action")`)
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_audit_logs_target_id" ON "audit_logs" ("target_id")`)
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_audit_logs_created_at" ON "audit_logs" ("created_at")`)

    // Ligne unique créée au premier enregistrement depuis l'admin ; en attendant, valeurs par défaut du code
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "platform_settings" (
        "id"         int        NOT NULL,
        "data"       jsonb      NOT NULL DEFAULT '{}',
        "updated_by" uuid       NULL,
        "updated_at" timestamp  NOT NULL DEFAULT now(),
        CONSTRAINT "PK_platform_settings_id" PRIMARY KEY ("id")
      )
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "platform_settings"`)
    await queryRunner.query(`DROP TABLE IF EXISTS "audit_logs"`)
    // Postgres ne permet pas de retirer une valeur d'enum : les superadmins redeviennent admins
    await queryRunner.query(`UPDATE "users" SET "role" = 'admin' WHERE "role" = 'superadmin'`)
  }
}
