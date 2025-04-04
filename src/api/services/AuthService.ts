import bcrypt from "bcrypt";
import { Repository } from "typeorm";
import { User } from "../../database/entities/User";
import { AppDataSource } from "../../database/connection";
import { ValidationError } from "../errors/ValidationError";
import jwt from "jsonwebtoken";
import { config } from '../../config/dotenv';

interface UserLogin {
  id: number;
  password: string;
}

export class AuthService {
  private userRepository!: Repository<User>;

  constructor() {
    this.initializeRepository();
  }

  private async initializeRepository() {
    this.userRepository = AppDataSource.getRepository(User);
  }

  async createAuth(email: string, password: string): Promise<string> {
    const regexEmail = new RegExp(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i);

    if (!regexEmail.test(email)) {
      throw new ValidationError(400, "Bad Request", "Typed email is not valid");
    }

    let user: UserLogin | null;
    
    user = await this.userRepository.findOne({ 
      where: { email },
      select: ["id", "password"],
    });

    if (!user || !bcrypt.compareSync(password, user.password)) {
      throw new ValidationError(
        400,
        "Bad Request",
        "Typed email/password is not valid",
      );
    }

    const token = jwt.sign(
      { id: user.id },
      config.JWT_SECRET as string,
      {
        expiresIn: config.JWT_EXPIRATION,
      },
    );

    return token;
  }
}
