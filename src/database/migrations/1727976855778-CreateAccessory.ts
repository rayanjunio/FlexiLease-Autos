import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from "typeorm";

export class CreateAccessory1727976855778 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "accessories",
        columns: [
          {
            name: "id",
            type: "integer",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "name",
            type: "varchar",
          },
          {
            name: "carId",
            type: "integer",
            isNullable: true,
          },
        ],
      }),
    );

    await queryRunner.createForeignKey(
      "accessories",
      new TableForeignKey({
        columnNames: ["carId"],
        referencedColumnNames: ["id"],
        referencedTableName: "cars",
        onDelete: "CASCADE",
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey("accessories", "carId");
    await queryRunner.dropTable("accessories");
  }
}
