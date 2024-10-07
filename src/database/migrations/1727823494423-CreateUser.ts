import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateUser1727823494423 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "users",
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
            length: "100",
          },
          {
            name: "cpf",
            type: "varchar",
            length: "11",
            isUnique: true,
          },
          {
            name: "birth",
            type: "date",
          },
          {
            name: "email",
            type: "varchar",
            length: "100",
            isUnique: true,
          },
          {
            name: "password",
            type: "varchar",
          },
          {
            name: "qualified",
            type: "boolean",
          },
          {
            name: "cep",
            type: "varchar",
            length: "8",
          },
          {
            name: "neighborhood",
            type: "varchar",
            length: "100",
          },
          {
            name: "street",
            type: "varchar",
            length: "100",
          },
          {
            name: "complement",
            type: "varchar",
            length: "100",
          },
          {
            name: "city",
            type: "varchar",
            length: "40",
          },
          {
            name: "uf",
            type: "varchar",
            length: "2",
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("users");
  }
}
