import { NextFunction, Request, Response } from "express";
import { ValidationError } from "../errors/ValidationError";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../../database/connection";
import { User } from "../../database/entities/User";
import { config } from '../../config/dotenv';

declare global {
  namespace Express {
    interface Request {
      userId?: number;
    }
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(400).json({
      code: 400,
      status: "Bad Request",
      message: "Token not provided",
    });
  }

  const [, token] = authHeader.split(" ");

  try {
    const decoded = jwt.verify(
      token,
      config.JWT_SECRET as string,
    ) as { id: number };

    const userRepository = AppDataSource.getRepository(User);
    const user: User | null = await userRepository.findOne({
      where: { id: decoded.id }, 
      select: ["id"],
    });

    if (!user) {
      return res.status(401).json({
        code: 401,
        status: "Unauthorized",
        message: "User not found",
      });
    }

    req.userId = user.id;
    next();
  }
  catch (error) {
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
};
