import { MigrationInterface, QueryRunner } from 'typeorm'

// Seule dans sa transaction : la valeur doit être validée avant que la migration suivante l'utilise
export class AddSuperAdminRole1792454300000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TYPE "users_role_enum" ADD VALUE IF NOT EXISTS 'superadmin'`)
  }

  public async down(): Promise<void> {
    // Postgres ne permet pas de retirer une valeur d'enum (sans effet : voir la migration suivante)
  }
}
