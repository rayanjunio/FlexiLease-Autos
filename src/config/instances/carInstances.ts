import { AppDataSource } from "../../database/connection";
import { Repository } from "typeorm";
import { Car } from "../../database/entities/Car";
import { Accessory } from "../../database/entities/Accessory";
import { CarService } from "../../api/services/CarService";
import { AccessoryService } from "../../api/services/AccessoryService";
import { CarController } from "../../api/controllers/CarController";

// repositories
const carRepository: Repository<Car> = AppDataSource.getRepository(Car);
const accessoryRepository: Repository<Accessory> = AppDataSource.getRepository(Accessory);

// services
const accessoryService: AccessoryService = new AccessoryService(accessoryRepository);
const carService: CarService = new CarService(carRepository, accessoryService, accessoryRepository);

// controller
export const carController: CarController = new CarController(carService);