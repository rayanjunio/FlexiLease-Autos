import { AuthController } from "../../api/controllers/AuthController";
import { AppDataSource } from "../../database/connection";
import { User } from "../../database/entities/User";
import { Repository } from "typeorm";
import { AuthService } from "../../api/services/AuthService";

// repository
const userRepository: Repository<User> = AppDataSource.getRepository(User);

// service
const authService: AuthService = new AuthService(userRepository);

// controller
export const authController: AuthController = new AuthController(authService);
