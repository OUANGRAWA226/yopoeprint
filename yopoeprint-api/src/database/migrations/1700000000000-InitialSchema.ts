import { MigrationInterface, QueryRunner } from 'typeorm'

// Schéma de départ : users, products, orders et leurs enums.
// Ces tables n'étaient créées que par `synchronize` (dev) : sur une base neuve,
// les migrations suivantes échouaient faute de tables. Tout est idempotent
// (IF NOT EXISTS) : sans effet sur une base existante, et les migrations
// suivantes (ADD COLUMN IF NOT EXISTS…) restent sans effet sur une base neuve.
// Noms d'enums alignés sur ceux générés par TypeORM (<table>_<colonne>_enum).
const ENUMS: Array<[string, string[]]> = [
  ['users_role_enum', ['client', 'reseller', 'staff', 'admin', 'superadmin']],
  ['products_category_enum', [
    'flyers', 'cartes-de-visite', 'affiches', 'brochures', 'roll-up',
    'goodies', 'textile', 'evenementiel', 'signaletique', 'corporate',
  ]],
  ['products_badge_enum', ['popular', 'new', 'promo']],
  ['orders_status_enum', [
    'pending', 'confirmed', 'bat_pending', 'in_production', 'ready',
    'shipped', 'delivered', 'cancelled', 'refunded',
  ]],
  ['orders_payment_method_enum', ['orange_money', 'moov_money', 'visa', 'mastercard', 'virement']],
  ['orders_payment_status_enum', ['pending', 'paid', 'failed', 'refunded']],
]

export class InitialSchema1700000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const [name, values] of ENUMS) {
      const list = values.map((v) => `'${v}'`).join(', ')
      await queryRunner.query(`
        DO $$ BEGIN
          CREATE TYPE "${name}" AS ENUM (${list});
        EXCEPTION WHEN duplicate_object THEN NULL;
        END $$
      `)
    }

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id"                         uuid               NOT NULL DEFAULT gen_random_uuid(),
        "first_name"                 varchar            NOT NULL,
        "last_name"                  varchar            NOT NULL,
        "email"                      varchar            NOT NULL,
        "phone"                      varchar            NULL,
        "password_hash"              varchar            NOT NULL,
        "role"                       "users_role_enum"  NOT NULL DEFAULT 'client',
        "loyalty_points"             integer            NOT NULL DEFAULT 0,
        "is_active"                  boolean            NOT NULL DEFAULT true,
        "email_verified"             boolean            NOT NULL DEFAULT false,
        "birth_date"                 date               NULL,
        "terms_accepted_at"          timestamptz        NULL,
        "refresh_token"              varchar            NULL,
        "password_reset_token_hash"  varchar            NULL,
        "password_reset_expires_at"  timestamptz        NULL,
        "company_name"               varchar            NULL,
        "reseller_status"            varchar(20)        NULL,
        "reseller_applied_at"        timestamptz        NULL,
        "reseller_profile"           jsonb              NULL,
        "addresses"                  jsonb              NOT NULL DEFAULT '[]',
        "created_at"                 timestamp          NOT NULL DEFAULT now(),
        "updated_at"                 timestamp          NOT NULL DEFAULT now(),
        CONSTRAINT "PK_users_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "UQ_users_phone" UNIQUE ("phone")
      )
    `)

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "products" (
        "id"             uuid                      NOT NULL DEFAULT gen_random_uuid(),
        "slug"           varchar                   NOT NULL,
        "name"           varchar                   NOT NULL,
        "description"    text                      NOT NULL,
        "short_desc"     varchar                   NOT NULL,
        "category"       "products_category_enum"  NOT NULL,
        "badge"          "products_badge_enum"     NULL,
        "emoji"          varchar                   NOT NULL,
        "bg_gradient"    varchar                   NOT NULL,
        "image_url"      varchar                   NULL,
        "images"         jsonb                     NOT NULL DEFAULT '[]',
        "base_price"     integer                   NOT NULL,
        "min_quantity"   integer                   NOT NULL,
        "formats"        jsonb                     NOT NULL DEFAULT '[]',
        "papers"         jsonb                     NOT NULL DEFAULT '[]',
        "quantities"     jsonb                     NOT NULL DEFAULT '[]',
        "finishes"       jsonb                     NOT NULL DEFAULT '[]',
        "delivery_days"  integer                   NOT NULL DEFAULT 3,
        "is_active"      boolean                   NOT NULL DEFAULT true,
        "is_popular"     boolean                   NOT NULL DEFAULT false,
        "sort_order"     integer                   NOT NULL DEFAULT 0,
        "is_home_offer"  boolean                   NOT NULL DEFAULT false,
        "in_calculator"  boolean                   NOT NULL DEFAULT false,
        "offer_quantity" integer                   NULL,
        "created_at"     timestamp                 NOT NULL DEFAULT now(),
        "updated_at"     timestamp                 NOT NULL DEFAULT now(),
        CONSTRAINT "PK_products_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_products_slug" UNIQUE ("slug")
      )
    `)

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "orders" (
        "id"                       uuid                          NOT NULL DEFAULT gen_random_uuid(),
        "order_number"             varchar                       NOT NULL,
        "user_id"                  uuid                          NOT NULL,
        "status"                   "orders_status_enum"          NOT NULL DEFAULT 'pending',
        "items"                    jsonb                         NOT NULL DEFAULT '[]',
        "subtotal"                 integer                       NOT NULL,
        "delivery_cost"            integer                       NOT NULL DEFAULT 0,
        "discount"                 integer                       NOT NULL DEFAULT 0,
        "total"                    integer                       NOT NULL,
        "delivery_address"         jsonb                         NOT NULL,
        "payment_method"           "orders_payment_method_enum"  NULL,
        "payment_status"           "orders_payment_status_enum"  NOT NULL DEFAULT 'pending',
        "payment_transaction_id"   varchar                       NULL,
        "cinetpay_token"           varchar                       NULL,
        "promo_code"               varchar                       NULL,
        "internal_notes"           text                          NULL,
        "customer_notes"           text                          NULL,
        "white_label"              boolean                       NOT NULL DEFAULT false,
        "white_label_sender"       jsonb                         NULL,
        "bat_url"                  varchar                       NULL,
        "bat_verso_url"            varchar                       NULL,
        "bat_status"               varchar                       NULL,
        "bat_notes"                text                          NULL,
        "bat_approved_at"          timestamp                     NULL,
        "bat_approved_by"          varchar                       NULL,
        "bat_rejected_reason"      text                          NULL,
        "bat_correction_file_url"  varchar                       NULL,
        "bat_history"              jsonb                         NOT NULL DEFAULT '[]',
        "estimated_delivery"       timestamp                     NULL,
        "delivered_at"             timestamp                     NULL,
        "created_at"               timestamp                     NOT NULL DEFAULT now(),
        "updated_at"               timestamp                     NOT NULL DEFAULT now(),
        CONSTRAINT "PK_orders_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_orders_order_number" UNIQUE ("order_number"),
        CONSTRAINT "FK_orders_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id")
      )
    `)
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_orders_user_id" ON "orders" ("user_id")`)
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_orders_payment_transaction_id" ON "orders" ("payment_transaction_id")`)
  }

  public async down(): Promise<void> {
    // Volontairement sans effet : ne jamais supprimer les tables de base (clients, commandes) par un revert
  }
}
