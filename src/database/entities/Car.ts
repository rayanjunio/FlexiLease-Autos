import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Reserve } from "./Reserve";
import { ValidationError } from "../../api/errors/ValidationError";

export interface IAccessory {
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
  valuePerDay!: number;

  @Column("text")
  accessories!: string;

  @Column()
  numberOfPassengers!: number;

  @OneToMany(() => Reserve, (reserve) => reserve.carId)
  reserves!: Reserve[];

  getAcessories(): IAccessory[] {
    return JSON.parse(this.accessories);
  }

  setAccessories(accessories: IAccessory[]): void {
    this.accessories = JSON.stringify(accessories);
  }

  public hasAccessory(accessoryName: string): boolean {
    const accessoriesArray = this.getAcessories();
    return accessoriesArray.some((acessory) => acessory.name === accessoryName);
  }

  public removeAccessory(accessoryName: string): void {
    const accessoriesArray = this.getAcessories();
    const updatedAccessories = accessoriesArray.filter(
      (acessory) => acessory.name !== accessoryName,
    );
    this.setAccessories(updatedAccessories);
  }

  public addAccessory(newAccessory: IAccessory): void {
    const accessoriesArray = this.getAcessories();
    if (this.hasAccessory(newAccessory.name)) {
      const message = `Accessory ${newAccessory.name} already exists.`;
      throw new ValidationError(400, "Bad Request", message);
    }
    accessoriesArray.push(newAccessory);
    this.setAccessories(accessoriesArray);
  }
}
