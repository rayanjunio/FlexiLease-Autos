import { Repository } from "typeorm";
import { Car } from "../../database/entities/Car";
import { getConnection } from "../../database/connection";
import { ValidationError } from "../errors/ValidationError";
import { Accessory } from "../../database/entities/Accessory";
import { AccessoryService } from "./AccessoryService";

interface CarResponse {
  id: number;
  model: string;
  color: string;
  year: number;
  valuePerDay: number;
  accessories: { name: string }[];
  numberOfPassengers: number;
}

export class CarService {
  private carRepository!: Repository<Car>;
  private accessoryService: AccessoryService;
  private accessoryRepository!: Repository<Accessory>;

  constructor() {
    this.initializeRepository();
    this.accessoryService = new AccessoryService();
  }

  private async initializeRepository() {
    const connect = await getConnection();
    this.carRepository = connect.getRepository(Car);
    this.accessoryRepository = connect.getRepository(Accessory);
  }

  async createCar(
    model: string,
    color: string,
    year: number,
    valuePerDay: number,
    accessories: Accessory[],
    numberOfPassengers: number,
  ): Promise<Car> {
    const hasAccessories = accessories.length > 0;

    if (!hasAccessories) {
      const message = "User needs at least one accessory.";
      throw new ValidationError(400, "Bad Request", message);
    }

    const validYear = year > 1950 && year < 2023;

    if (!validYear) {
      const message = "The car year must be between 1950 and 2023";
      throw new ValidationError(400, "Bad Request", message);
    }

    if (this.hasDuplicates(accessories)) {
      throw new ValidationError(
        400,
        "Bad Request",
        "Not allowed duplicated accessories",
      );
    }

    const newCar = new Car();
    newCar.model = model;
    newCar.color = color;
    newCar.year = year;
    newCar.valuePerDay = valuePerDay;
    newCar.numberOfPassengers = numberOfPassengers;

    newCar.accessories = await Promise.all(
      accessories.map(async (accessoryData) => {
        const accessory = new Accessory();
        accessory.name = accessoryData.name;
        accessory.car = newCar;
        return await this.accessoryService.createAccessory(accessory.name);
      }),
    );

    return await this.carRepository.save(newCar);
  }

  public async getAllCars(
    parameters: Partial<Car>,
    limit: number,
    offset: number,
  ): Promise<{ cars: Car[]; total: number }> {
    const query = this.carRepository
      .createQueryBuilder("car")
      .leftJoinAndSelect("car.accessories", "accessory");
  
    for (const parameter of Object.keys(parameters) as (keyof Partial<Car>)[]) {
      if (parameters[parameter] !== undefined) {
        query.andWhere(`car.${parameter} = :${parameter}`, {
          [parameter]: parameters[parameter],
        });
      }
    }
  
    const [cars, total] = await query
      .skip(offset)
      .take(limit) 
      .getManyAndCount();
  
    return { cars, total };
  }

  public async getCarById(id: number): Promise<Car | undefined> {
    const car = await this.carRepository.findOne({
      where: { id },
      relations: ["accessories"],
    });

    if (!car) {
      const message = "This car does not exist";
      throw new ValidationError(404, "Not Found", message);
    }

    return car;
  }

  public async updateCar(
    id: number,
    carData: Partial<Car>,
  ): Promise<Car | undefined> {
    const car = await this.carRepository.findOne({
      where: { id },
      relations: ["accessories"],
    });

    if (!car) {
      const message = "This car does not exist";
      throw new ValidationError(404, "Not Found", message);
    }

    if (carData.model) car.model = carData.model;
    if (carData.color) car.color = carData.color;

    if (carData.year) {
      if (carData.year <= 1950 || carData.year >= 2023) {
        const message = "The car year must be between 1950 and 2023";
        throw new ValidationError(400, "Bad Request", message);
      }
      car.year = carData.year;
    }

    if (carData.valuePerDay) car.valuePerDay = carData.valuePerDay;

    if (Array.isArray(carData.accessories)) {
       if (this.hasDuplicates(carData.accessories)) {
        throw new ValidationError(
          400,
          "Bad Request",
          "Not allowed duplicated accessories",
        );
      } 
      const existingAccessoryIds = car.accessories.map(
        (accessory) => accessory.id,
      );
      const newAccessories = carData.accessories.filter(
        (accessory) => !existingAccessoryIds.includes(accessory.id),
      );

      for (const accessoryData of newAccessories) {
        const accessory = await this.accessoryService.createAccessory(
          accessoryData.name,
        );
        car.accessories.push(accessory);
      }

      const accessoriesToRemove = existingAccessoryIds.filter(
        (id) => !carData.accessories?.some((a) => a.id === id),
      );

      car.accessories = car.accessories.filter(
        (accessory) => !accessoriesToRemove.includes(accessory.id),
      );
    }

    if (carData.numberOfPassengers) {
      car.numberOfPassengers = carData.numberOfPassengers;
    }

    return await this.carRepository.save(car);
  }

  async updateAccessory(
    carId: number,
    accessoryData: { name: string },
  ): Promise<CarResponse> {
    const car = await this.carRepository.findOne({
      where: { id: carId },
      relations: ["accessories"],
    });

    if (!car) {
      const message = "This car does not exist";
      throw new ValidationError(404, "Not Found", message);
    }

    const existingAccessory = car.accessories.find(
      (a) => a.name === accessoryData.name,
    );

    if (existingAccessory) {
      await this.accessoryRepository.delete(existingAccessory.id);
      car.accessories = car.accessories.filter(
        (accessory) => accessory !== existingAccessory,
      );
    } else {
      const newAccessory = new Accessory();
      newAccessory.name = accessoryData.name;
      newAccessory.car = car;

      await this.accessoryRepository.save(newAccessory);
      car.accessories.push(newAccessory);
    }

    const updatedCar = await this.carRepository.save(car);

    return {
      id: updatedCar.id,
      model: updatedCar.model,
      color: updatedCar.color,
      year: updatedCar.year,
      valuePerDay: updatedCar.valuePerDay,
      accessories: updatedCar.accessories.map((accessory) => ({
        name: accessory.name,
      })),
      numberOfPassengers: updatedCar.numberOfPassengers,
    };
  }

  public async deleteCar(id: number) {
    const car = await this.carRepository.findOne({
      where: { id },
      relations: ["accessories"],
    });

    if (!car) {
      const message = "This car does not exist";
      throw new ValidationError(404, "Not Found", message);
    }

    await this.carRepository.remove(car);
  }

  private hasDuplicates(accessoriesArray?: Accessory[]): boolean {
    if (!Array.isArray(accessoriesArray)) {
      return false;
    }

    const accessoryNames = accessoriesArray.map((accessory) => accessory.name);
    return new Set(accessoryNames).size !== accessoryNames.length;
  }
}
