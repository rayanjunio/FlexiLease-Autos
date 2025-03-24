import { DataSource } from "typeorm";
import { Accessory } from "./entities/Accessory";
import { Car } from "./entities/Car";
import { Reserve } from "./entities/Reserve";
import { User } from "./entities/User";

export const AppDataSource = new DataSource({
  type: "sqlite",
  database: "src/database/db.sqlite",
  entities: [Accessory, Car, Reserve, User],
  synchronize: false,
});