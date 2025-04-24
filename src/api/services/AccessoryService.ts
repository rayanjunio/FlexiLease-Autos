import { Repository } from "typeorm";
import { Accessory } from "../../database/entities/Accessory";
import { ValidationError } from "../errors/ValidationError";
import { Car } from "../../database/entities/Car";

export class AccessoryService {
  constructor(private accessoryRepository: Repository<Accessory>) {}

  async createAccessory(name: string): Promise<Accessory> {
    if(!name || name.trim() === "") {
      const message: string = "accessory can't have an empty name";
      throw new ValidationError(400, "Bad Request", message);
    }
    const accessory = new Accessory();
    accessory.name = name;

    return await this.accessoryRepository.save(accessory);
  }

  async handleAccessoryUpdate(
    newAccessory: { name: string },
    car: Car,
  ): Promise<Accessory | null> {
    if (!newAccessory || newAccessory.name.trim() === "") {
      const message: string = "Accessory name cannot be empty";
      throw new ValidationError(400, "Bad Request", message);
    }

    const accessoryRepeated: Accessory | undefined = car.accessories.find(
      accessory => accessory.name.includes(newAccessory.name));

    if(accessoryRepeated) {
      await this.deleteAccessory(accessoryRepeated.id);
      return null;
    }  

    let createdAccessory: Accessory = new Accessory();

    createdAccessory.name = newAccessory.name;
    createdAccessory.car = car;

    await this.accessoryRepository.save(createdAccessory);

    return createdAccessory;
  }

  async deleteAccessory(id: number): Promise<void> {
    await this.accessoryRepository.delete(id);
  }

  async synchronizeAccessories(
    currentAccessories: Accessory[],
    newAccessories: Partial<Accessory>[],
  ): Promise<Accessory[]> {
    if(this.hasDuplicates(newAccessories)) {
      throw new ValidationError(
        400,
        "Bad Request",
        "Not allowed duplicated accessories"
      );
    }

    const currentNames: string[] = currentAccessories.map(accessory => accessory.name);

    const newNames: string[] = newAccessories
      .map(accessory => accessory.name)
      .filter((name): name is string => typeof name === "string");

    const namesToAdd: string[] = newNames.filter(name => !currentNames.includes(name));

    const updatedAccessories: Accessory[] = currentAccessories.filter(
      accessory => !newNames.includes(accessory.name),
    );

    const accessoriesToDelete: Accessory[] = currentAccessories.filter(
      accessory => newNames.includes(accessory.name),
    );

    for(const acc of accessoriesToDelete) 
      await this.deleteAccessory(acc.id);

    for(const name of namesToAdd) {
      const accessory = await this.createAccessory(name);
      updatedAccessories.push(accessory);
    }

    return updatedAccessories;
  }

  hasDuplicates(accessories?: Partial<Accessory>[]): boolean {
    if (!Array.isArray(accessories)) {
      return false;
    }
  
    const names = accessories.map((a) => a.name);
    return new Set(names).size !== names.length;
  }
}
