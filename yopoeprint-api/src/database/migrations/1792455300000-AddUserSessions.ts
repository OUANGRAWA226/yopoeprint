import { MigrationInterface, QueryRunner } from 'typeorm'

// Sessions multiples (une par appareil). Remplace la colonne users.refresh_token,
// qui n'autorisait qu'une session par compte : elle est vidée et n'est plus utilisée.
// Les jetons émis avant cette migration ne portent pas d'id de session : reconnexion requise.
export class AddUserSessions1792455300000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "user_sessions" (
        "id"           uuid         NOT NULL DEFAULT gen_random_uuid(),
        "user_id"      uuid         NOT NULL,
        "token_hash"   varchar(64)  NOT NULL,
        "previous_token_hash" varchar(64) NULL,
        "rotated_at"   timestamptz  NULL,
        "created_at"   timestamp    NOT NULL DEFAULT now(),
        "last_used_at" timestamptz  NOT NULL,
        "expires_at"   timestamptz  NOT NULL,
        CONSTRAINT "PK_user_sessions_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_user_sessions_user_id" FOREIGN KEY ("user_id")
          REFERENCES "users"("id") ON DELETE CASCADE
      )
    `)
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_user_sessions_user_id" ON "user_sessions" ("user_id")`)
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_user_sessions_expires_at" ON "user_sessions" ("expires_at")`)
    await queryRunner.query(`UPDATE "users" SET "refresh_token" = NULL WHERE "refresh_token" IS NOT NULL`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "user_sessions"`)
  }
}
