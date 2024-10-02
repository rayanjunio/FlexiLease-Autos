import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateCar1727822455547 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "cars",
        columns: [
          {
            name: "id",
            type: "integer",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "model",
            type: "varchar",
            length: "50",
          },
          {
            name: "color",
            type: "varchar",
            length: "40",
          },
          {
            name: "year",
            type: "integer",
          },
          {
            name: "valuePerDay",
            type: "integer",
          },
          {
            name: "acessories",
            type: "json",
          },
          {
            name: "numberOfPassengers",
            type: "integer",
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("cars");
  }
}
