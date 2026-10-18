import { MigrationInterface, QueryRunner } from 'typeorm'

// Bannières du carrousel d'accueil, gérées depuis l'admin (visuels 1248 × 357 px, version mobile 660 × 330 px)
export class AddBanners1792454500000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "banners" (
        "id"               uuid          NOT NULL DEFAULT gen_random_uuid(),
        "title"            varchar(120)  NOT NULL,
        "subtitle"         varchar(200)  NULL,
        "badge"            varchar(40)   NULL,
        "cta_label"        varchar(40)   NULL,
        "alt_text"         varchar(200)  NULL,
        "image_url"        text          NOT NULL,
        "mobile_image_url" text          NULL,
        "link_url"         varchar(300)  NOT NULL,
        "position"         int           NOT NULL DEFAULT 0,
        "is_active"        boolean       NOT NULL DEFAULT true,
        "starts_at"        timestamptz   NULL,
        "ends_at"          timestamptz   NULL,
        "created_at"       timestamp     NOT NULL DEFAULT now(),
        "updated_at"       timestamp     NOT NULL DEFAULT now(),
        CONSTRAINT "PK_banners_id" PRIMARY KEY ("id")
      )
    `)
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_banners_position" ON "banners" ("position")`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "banners"`)
  }
}
