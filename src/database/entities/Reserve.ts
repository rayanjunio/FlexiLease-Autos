import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./User";
import { Car } from "./Car";

@Entity("reserves")
export class Reserve {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  startDate!: Date;

  @Column()
  endDate!: Date;

  @Column()
  finalValue!: number;

  @ManyToOne(() => User, (user) => user.reserves)
  @JoinColumn({ name: "userId" })
  userId!: User;

  @ManyToOne(() => Car, (car) => car.reserves)
  @JoinColumn({ name: "carId" })
  carId!: Car;
}
