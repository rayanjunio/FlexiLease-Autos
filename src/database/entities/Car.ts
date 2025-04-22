import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Reserve } from "./Reserve";
import { ValidationError } from "../../api/errors/ValidationError";
import { Accessory } from "./Accessory";

@Entity("cars")
export class Car {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  model!: string;

  @Column()
  color!: string;

  @Column()
  year!: number;

  @Column()
  valuePerDay!: number;

  @Column()
  numberOfPassengers!: number;

  @OneToMany(() => Reserve, (reserve) => reserve.carId)
  reserves!: Reserve[];

  @OneToMany(() => Accessory, (accessory) => accessory.car, {
    cascade: true,
    orphanedRowAction: "delete",  
  })
  accessories!: Accessory[];
}
