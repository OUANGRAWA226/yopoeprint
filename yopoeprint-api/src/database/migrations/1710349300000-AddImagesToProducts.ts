import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm'

export class AddImagesToProducts1710349300000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
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
