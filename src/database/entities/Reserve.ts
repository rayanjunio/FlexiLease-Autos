import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./User";
import { Car } from "./Car";

@Entity("reserves")
export class Reserve {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  startDate!: string;

  @Column()
  endDate!: string;

  @Column()
  finalValue!: number;

  @ManyToOne(() => User, (user) => user.id)
  userId!: number;

  @ManyToOne(() => Car, (car) => car.id)
  carId!: number;
}
