import { Repository } from "typeorm";
import { Accessory } from "../../database/entities/Accessory";
import { ValidationError } from "../errors/ValidationError";

export class AccessoryService {
  constructor(private accessoryRepository: Repository<Accessory>) {}

  async createAccessory(name: string): Promise<Accessory> {
    const accessory = new Accessory();
    accessory.name = name;

    return await this.accessoryRepository.save(accessory);
  }

  async getAccessoryById(id: number): Promise<Accessory | null> {
    return await this.accessoryRepository.findOne({ where: { id } });
  }

  async updateAccessory(
    id: number,
    name: string,
  ): Promise<Accessory | undefined> {
    if (!name || name.trim() === "") {
      throw new Error("Accessory name cannot be empty");
    }

    const accessory = await this.getAccessoryById(id);

    if (!accessory) {
      throw new Error("Accessory not found");
    }

    accessory.name = name;
    return await this.accessoryRepository.save(accessory);
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
    const namesToKeep: string[] = newNames;

    const updatedAccessories: Accessory[] = currentAccessories.filter(
      accessory => namesToKeep.includes(accessory.name),
    );

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
