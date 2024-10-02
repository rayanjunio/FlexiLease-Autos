import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Reserve } from "./Reserve";

interface IAcessory {
  name: string;
}

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
  valuePerDay!: string;

  @Column("text")
  acessories!: string;

  @Column()
  numberOfPassengers!: number;

  @OneToMany(() => Reserve, (reserve) => reserve.carId)
  reserve!: Reserve[];

  getAcessories(): IAcessory[] {
    return JSON.parse(this.acessories);
  }

  setAcessories(acessories: IAcessory[]): void {
    this.acessories = JSON.stringify(acessories);
  } 
}
