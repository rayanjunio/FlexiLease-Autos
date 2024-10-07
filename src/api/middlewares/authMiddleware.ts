import { NextFunction, Request, Response } from "express";
import { ValidationError } from "../errors/ValidationError";
import jwt from "jsonwebtoken";
import { getConnection } from "../../database/connection";
import { User } from "../../database/entities/User";

declare global {
  namespace Express {
    interface Request {
      user?: User;
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
      "njnckmlazlnxidih83934g5j90vniejincb89233hjn2ivcieonihyvtzftg9xsinmc",
    ) as { id: number };

    const connect = await getConnection();
    const userRepository = connect.getRepository(User);
    const user = await userRepository.findOne({ where: { id: decoded.id } });

    if (!user) {
      return res.status(401).json({
        code: 401,
        status: "Unauthorized",
        message: "User not found",
      });
    }

    req.user = user;
    next();
  } catch (error) {
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
