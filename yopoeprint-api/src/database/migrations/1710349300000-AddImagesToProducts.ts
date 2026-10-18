import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm'

export class AddImagesToProducts1710349300000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Idempotente : la colonne existe déjà sur les bases créées par synchronize
    if (await queryRunner.hasColumn('products', 'images')) return
    await queryRunner.addColumn(
      'products',
      new TableColumn({
        name: 'images',
        type: 'jsonb',
        isNullable: false,
        default: '[]',
      })
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('products', 'images')
  }
}
