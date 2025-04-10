import { AppDataSource } from "../../database/connection";
import { Repository } from "typeorm";
import { Car } from "../../database/entities/Car";
import { User } from "../../database/entities/User";
import { Reserve } from "../../database/entities/Reserve";
import { ReserveService } from "../../api/services/ReserveService";
import { ReserveController } from "../../api/controllers/ReserveController";

// repositories
const reserveRepository: Repository<Reserve> = AppDataSource.getRepository(Reserve);
const carRepository: Repository<Car> = AppDataSource.getRepository(Car);
const userRepository: Repository<User> = AppDataSource.getRepository(User);

// services
const reserveService: ReserveService = new ReserveService(reserveRepository, carRepository, userRepository);

// controller
export const reserveController: ReserveController = new ReserveController(reserveService);