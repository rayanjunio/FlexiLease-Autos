import { Repository } from "typeorm";
import { Car } from "../../database/entities/Car";
import { ValidationError } from "../errors/ValidationError";
import { Accessory } from "../../database/entities/Accessory";
import { AccessoryService } from "./AccessoryService";
import { RedisClientType } from "redis";

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
  constructor(private carRepository: Repository<Car>,
    private accessoryService: AccessoryService,
    private accessoryRepository: Repository<Accessory>,
    private redisClient: RedisClientType) {}

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

    if (this.accessoryService.hasDuplicates(accessories)) {
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

    newCar.accessories = accessories.map((accessoryData) => {
        const accessory = new Accessory();
        accessory.name = accessoryData.name;
        accessory.car = newCar;
        return accessory;
      });

    return await this.carRepository.save(newCar);
  }

  public async getAllCars(
    parameters: Partial<Car>,
    limit: number,
    offset: number,
  ): Promise<{ cars: Car[]; total: number }> {
    const [cars, total] = await this.carRepository.findAndCount({
      where: parameters,
      relations: ["accessories"],
      skip: offset,
      take: limit,
    });

    return { cars, total };
  }

  public async getCarById(id: number): Promise<Car | undefined> {
    const cacheKey = `car:${id}`;

    const cachedCar = await this.redisClient.get(cacheKey);

    if(cachedCar) {
      return JSON.parse(cachedCar);
    }

    const car = await this.carRepository.findOne({
      where: { id },
      relations: ["accessories"],
    });

    if (!car) {
      const message = "This car does not exist";
      throw new ValidationError(404, "Not Found", message);
    }

    await this.redisClient.setEx(cacheKey, 300, JSON.stringify(car));

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
      car.accessories = await this.accessoryService.synchronizeAccessories(
        car.accessories,
        carData.accessories,
      );
    }

    if (carData.numberOfPassengers) {
      car.numberOfPassengers = carData.numberOfPassengers;
    }

    this.redisClient.del(`car:${id}`);

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

    const newAccessory = await this.accessoryService.handleAccessoryUpdate(accessoryData, car);

    if (newAccessory) 
      car.accessories.push(newAccessory);
    else 
      car.accessories = car.accessories.filter(accessory => !accessory.name.includes(accessoryData.name));

    const updatedCar = await this.carRepository.save(car);

    this.redisClient.del(`car:${carId}`);

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

    this.redisClient.del(`car:${id}`);
  }
}
