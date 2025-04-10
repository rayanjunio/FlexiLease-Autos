import { Repository } from "typeorm";
import { Accessory } from "../../database/entities/Accessory";

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
}
