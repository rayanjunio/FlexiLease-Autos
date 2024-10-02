import { Repository } from "typeorm";
import { Car, IAccessory } from "../../database/entities/Car";
import connection from "../../database/connection";
import { ValidationError } from "../errors/ValidationError";

export class CarService {
  private carRepository!: Repository<Car>;

  constructor() {
    this.initializeRepository();
  }

  private async initializeRepository() {
    const connect = await connection();
    this.carRepository = connect.getRepository(Car);
  }

  async createCar(
    model: string,
    color: string,
    year: number,
    valuePerDay: number,
    accessories: IAccessory[],
    numberOfPassengers: number,
  ): Promise<Car> {
    const hasAccessories = accessories.length > 0 ? true : false;

    if (!hasAccessories) {
      const message = "User needs at least one accessory.";
      throw new ValidationError(400, "Bad Request", message);
    }

    const validYear = year > 1950 && year < 2023 ? true : false;

    if (!validYear) {
      const message = "The car year must be between 1950 and 2023";
      throw new ValidationError(400, "Bad Request", message);
    }

    if (this.hasDuplicates(accessories)) {
      const message = "Not allowed duplicated accessories";
      throw new ValidationError(404, "Bad Request", message);
    }

    const newCar = new Car();
    newCar.model = model;
    newCar.color = color;
    newCar.year = year;
    newCar.valuePerDay = valuePerDay;
    newCar.setAccessories(accessories);
    newCar.numberOfPassengers = numberOfPassengers;

    return await this.carRepository.save(newCar);
  }

  public async getAllCars(parameters: Partial<Car>): Promise<Car[]> {
    const query = this.carRepository.createQueryBuilder("car");

    for (const parameter of Object.keys(parameters) as (keyof Partial<Car>)[]) {
      if (parameters[parameter] !== undefined) {
        query.andWhere(`car.${parameter} = :${parameter}`, {
          [parameter]: parameters[parameter],
        });
      }
    }
    const result = await query.getMany();
    return result;
  }

  public async getCarById(id: number): Promise<Car | null> {
    const car = await this.carRepository.findOne({ where: { id } });
    if (!car) {
      const message = "This car does not exist";
      throw new ValidationError(404, "Not Found", message);
    }
    return car;
  }

  public async updateCar(id: number, carData: Partial<Car>): Promise<Car> {
    const car = await this.carRepository.findOne({ where: { id } });

    if (!car) {
      const message = "This car does not exist";
      throw new ValidationError(404, "Not Found", message);
    }

    if (carData.model) car.model = carData.model;
    if (carData.color) car.color = carData.color;
    if (carData.year) {
      const validYear =
        carData.year > 1950 && carData.year < 2023 ? true : false;

      if (!validYear) {
        const message = "The car year must be between 1950 and 2023";
        throw new ValidationError(400, "Bad Request", message);
      }

      car.year = carData.year;
    }
    if (carData.valuePerDay) car.valuePerDay = carData.valuePerDay;

    if (Array.isArray(carData.accessories)) {
      if (this.hasDuplicates(carData.accessories)) {
        const message = "Not allowed duplicated accessories";
        throw new ValidationError(400, "Bad Request", message);
      }

      car.setAccessories(carData.accessories);
    }

    if (carData.numberOfPassengers) {
      car.numberOfPassengers = carData.numberOfPassengers;
    }
    return await this.carRepository.save(car);
  }

  public async updateAccessory(
    id: number,
    nameAccessory: string,
  ): Promise<Car> {
    const car = await this.carRepository.findOne({ where: { id } });

    if (!car) {
      const message = "This car does not exist";
      throw new ValidationError(404, "Not Found", message);
    }

    if (car.hasAccessory(nameAccessory)) {
      car.removeAccessory(nameAccessory);
      return await this.carRepository.save(car);
    }

    const newAccessory: IAccessory = { name: nameAccessory };
    car.addAccessory(newAccessory);

    return await this.carRepository.save(car);
  }

  public async deleteCar(id: number) {
    const car = await this.carRepository.findOne({ where: { id } });

    if (!car) {
      const message = "This car does not exist";
      throw new ValidationError(404, "Not Found", message);
    }

    await this.carRepository.delete(id);
  }

  private hasDuplicates(accessoriesArray: IAccessory[]): boolean {
    const accessoryName = accessoriesArray.map((accessory) => accessory.name);
    return new Set(accessoryName).size !== accessoriesArray.length;
  }
}
