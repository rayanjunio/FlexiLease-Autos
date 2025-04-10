import { UserController } from "../../api/controllers/UserController";
import { AppDataSource } from "../../database/connection";
import { User } from "../../database/entities/User";
import { Reserve } from "../../database/entities/Reserve";
import { Repository } from "typeorm";
import { UserService } from "../../api/services/UserService";

// repositories
const userRepository: Repository<User> = AppDataSource.getRepository(User);
const reserveRepository: Repository<Reserve> = AppDataSource.getRepository(Reserve);

// service
const userService: UserService = new UserService(userRepository, reserveRepository);

// controller
export const userController: UserController = new UserController(userService);
