import { Request, Response } from "express";
import { ValidationError } from "../errors/ValidationError";
import { User } from "../../database/entities/User";
import { UserService } from "../services/UserService";
import { verifyUserCompatibility } from "../utils/validators/authorization";

export class UserController {
  constructor(private userService: UserService){}

  async createUser(req: Request, res: Response) {
    try {
      const { name, cpf, birth, cep, email, password } = req.body;

      const newUser = await this.userService.createUser(
        name,
        cpf,
        birth,
        cep,
        email,
        password,
      );

      return res.status(201).json(newUser);
    } catch (error: unknown) {
      if (error instanceof ValidationError) {
        return res.status(400).json({
          code: error.code,
          status: error.status,
          message: error.message,
        });
      }

      if (error instanceof Error) {
        return res.status(400).json({
          code: 400,
          status: "Bad Request",
          message: error.message,
        });
      }

      return res.status(500).json({
        code: 500,
        status: "Internal Server Error",
        message: "An unexpected error occurred",
      });
    }
  }

  async getUserById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const authenticatedUserId: number = req.userId as number;

      verifyUserCompatibility(id, authenticatedUserId);

      const user = await this.userService.getUserById(id, authenticatedUserId);

      return res.status(200).json(user);
    } catch (error: unknown) {
      if (error instanceof ValidationError) {
        return res.status(400).json({
          code: error.code,
          status: error.status,
          message: error.message,
        });
      }

      if (error instanceof Error) {
        return res.status(400).json({
          code: 400,
          status: "Bad Request",
          message: error.message,
        });
      }

      return res.status(500).json({
        code: 500,
        status: "Internal Server Error",
        message: "An unexpected error occurred",
      });
    }
  }

  async updateUser(req: Request, res: Response) {
    try {
      const authenticatedUserId: number = req.userId as number;
      const id = parseInt(req.params.id);

      verifyUserCompatibility(id, authenticatedUserId);

      const { name, cpf, birth, cep, email, password } = req.body;

      const UserData: Partial<User> = {
        name,
        cpf,
        birth,
        cep,
        email,
        password,
      };

      const updatedUser = await this.userService.updateUser(id, UserData);
      return res.status(200).json(updatedUser);
    } catch (error: unknown) {
      if (error instanceof ValidationError) {
        return res.status(400).json({
          code: error.code,
          status: error.status,
          message: error.message,
        });
      }

      if (error instanceof Error) {
        return res.status(400).json({
          code: 400,
          status: "Bad Request",
          message: error.message,
        });
      }

      return res.status(500).json({
        code: 500,
        status: "Internal Server Error",
        message: "An unexpected error occurred",
      });
    }
  }

  async deleteUser(req: Request, res: Response) {
    try {
      const authenticatedUserId: number = req.userId as number;
      const id = parseInt(req.params.id);

      verifyUserCompatibility(id, authenticatedUserId);

      await this.userService.deleteUser(id);

      return res.status(204).json();
    } catch (error: unknown) {
      if (error instanceof ValidationError) {
        return res.status(400).json({
          code: error.code,
          status: error.status,
          message: error.message,
        });
      }

      if (error instanceof Error) {
        return res.status(400).json({
          code: 400,
          status: "Bad Request",
          message: error.message,
        });
      }

      return res.status(500).json({
        code: 500,
        status: "Internal Server Error",
        message: "An unexpected error occurred",
      });
    }
  }
}
