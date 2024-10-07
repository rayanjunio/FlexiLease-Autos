import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { ValidationError } from "../errors/ValidationError";
import { User } from "../../database/entities/User";
import { UserService } from "../services/UserService";

export class UserController {
  private userService = new UserService();

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
    const id = parseInt(req.params.id);

    try {
      const token = req.headers.authorization?.split(" ")[1];

      if (!token) {
        return res.status(401).json({
          code: 401,
          status: "Unauthorized",
          message: "Token is required.",
        });
      }

      const decodedToken = (token: string) => {
        try {
          const decoded = jwt.verify(
            token,
            "njnckmlazlnxidih83934g5j90vniejincb89233hjn2ivcieonihyvtzftg9xsinmc",
          ) as { id: number };
          return decoded;
        } catch (error) {
          return null;
        }
      };

      const decoded = decodedToken(token);
      if (!decoded) {
        return res.status(400).json({
          code: 400,
          status: "Bad Request",
          message: "Invalid Token.",
        });
      }

      const authenticatedUserId = decoded.id;

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
      const token = req.headers.authorization?.split(" ")[1];

      if (!token) {
        return res.status(401).json({
          code: 401,
          status: "Unauthorized",
          message: "Token is required.",
        });
      }

      const decodedToken = (token: string) => {
        try {
          const decoded = jwt.verify(
            token,
            "njnckmlazlnxidih83934g5j90vniejincb89233hjn2ivcieonihyvtzftg9xsinmc",
          ) as { id: number };
          return decoded;
        } catch (error) {
          return null;
        }
      };

      const decoded = decodedToken(token);
      if (!decoded) {
        return res.status(400).json({
          code: 400,
          status: "Bad Request",
          message: "Invalid Token.",
        });
      }

      const authenticatedUserId = decoded.id;
      const id = parseInt(req.params.id);

      if (id !== authenticatedUserId) {
        return res.status(403).json({
          code: 403,
          status: "Forbidden",
          message: "You are not authorized to update this user's information.",
        });
      }

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
      const token = req.headers.authorization?.split(" ")[1];

      if (!token) {
        return res.status(401).json({
          code: 401,
          status: "Unauthorized",
          message: "Token is required.",
        });
      }

      const decodedToken = (token: string) => {
        try {
          const decoded = jwt.verify(
            token,
            "njnckmlazlnxidih83934g5j90vniejincb89233hjn2ivcieonihyvtzftg9xsinmc",
          ) as { id: number };
          return decoded;
        } catch (error) {
          return null;
        }
      };

      const decoded = decodedToken(token);
      if (!decoded) {
        return res.status(400).json({
          code: 400,
          status: "Bad Request",
          message: "Invalid Token.",
        });
      }

      const authenticatedUserId = decoded.id;
      const id = parseInt(req.params.id);

      if (id !== authenticatedUserId) {
        return res.status(403).json({
          code: 403,
          status: "Forbidden",
          message: "You are not authorized to delete this user.",
        });
      }

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
