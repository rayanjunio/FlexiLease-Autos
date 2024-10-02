import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from "typeorm";

export class CreateReserve1727824045415 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "reserves",
        columns: [
          {
            name: "id",
            type: "integer",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "startDate",
            type: "date",
          },
          {
            name: "endDate",
            type: "date",
          },
          {
            name: "finalValue",
            type: "decimal",
          },
          {
            name: "userId",
            type: "integer",
          },
          {
            name: "carId",
            type: "integer",
          },
        ],
      }),
    );

    await queryRunner.createForeignKey(
      "reserves",
      new TableForeignKey({
        columnNames: ["userId"],
        referencedTableName: "users",
        referencedColumnNames: ["id"],
      }),
    );

    await queryRunner.createForeignKey(
      "reserves",
      new TableForeignKey({
        columnNames: ["carId"],
        referencedTableName: "cars",
        referencedColumnNames: ["id"],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey("reserves", "userId");
    await queryRunner.dropForeignKey("reserves", "carId");
    await queryRunner.dropTable("reserves");
  }
}
