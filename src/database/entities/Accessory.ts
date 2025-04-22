import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Car } from "./Car";

@Entity("accessories")
export class Accessory {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @ManyToOne(() => Car, (car) => car.accessories, {
    onDelete: "CASCADE",
  })
  car!: Car;
}
