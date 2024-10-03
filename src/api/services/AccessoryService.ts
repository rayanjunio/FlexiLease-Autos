import { Repository } from "typeorm";
import { Accessory } from "../../database/entities/Accessory";
import connection from "../../database/connection";

export class AccessoryService {
  private accessoryRepository!: Repository<Accessory>;

  constructor() {
    this.initializeRepository();
  }

  private async initializeRepository() {
    const connect = await connection();
    this.accessoryRepository = connect.getRepository(Accessory);
  }

  async createAccessory(name: string): Promise<Accessory> {
    const accessory = new Accessory();
    accessory.name = name;

    return await this.accessoryRepository.save(accessory);
  }

  async getAccessoryById(id: number): Promise<Accessory | undefined> {
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
