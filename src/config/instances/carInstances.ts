import { AppDataSource } from "../../database/connection";
import { Repository } from "typeorm";
import { Car } from "../../database/entities/Car";
import { Accessory } from "../../database/entities/Accessory";
import { CarService } from "../../api/services/CarService";
import { AccessoryService } from "../../api/services/AccessoryService";
import { CarController } from "../../api/controllers/CarController";
import { RedisClientType } from "redis";
import { redisClient } from "../redis";

// repositories
const carRepository: Repository<Car> = AppDataSource.getRepository(Car);
const accessoryRepository: Repository<Accessory> = AppDataSource.getRepository(Accessory);

// redis
const redis: RedisClientType = redisClient;

// services
const accessoryService: AccessoryService = new AccessoryService(accessoryRepository);
const carService: CarService = new CarService(carRepository, accessoryService, accessoryRepository, redis);

// controller
export const carController: CarController = new CarController(carService);