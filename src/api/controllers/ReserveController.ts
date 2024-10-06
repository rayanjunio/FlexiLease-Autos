import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { ValidationError } from "../errors/ValidationError";
import { ReserveService } from "../services/ReserveService";

export class ReserveController {
  private reserveService = new ReserveService();

  async createReserve(req: Request, res: Response) {
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

      const { startDate, endDate, carId } = req.body;

      const decoded = decodedToken(token);
      if (!decoded) {
        return res.status(400).json({
          code: 400,
          status: "Bad Request",
          message: "Invalid Token.",
        });
      }

      const userId = decoded.id;

      const newReserve = await this.reserveService.createReserve(
        startDate,
        endDate,
        carId,
        userId,
      );

      const formattedReserve = {
        id: newReserve.id,
        startDate,
        endDate,
        finalValue: newReserve.finalValue,
        carId,
        userId,
      };

      return res.status(201).json(formattedReserve);
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

  async getAllReservesFromUser(req: Request, res: Response) {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
        return res.status(401).json({
          code: 401,
          status: "Unauthorized",
          message: "Token not provided.",
        });
      }

      const decodedToken = (token: string) => {
        try {
          const decoded = jwt.verify(
            token,
            "njnckmlazlnxidih83934g5j90vniejincb89233hjn2ivcieonihyvtzftg9xsinmc",
          );

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

      const userId =
        (decoded as any).userId || (decoded as any).id || (decoded as any).sub;

      if (!userId) {
        return res.status(400).json({
          code: 400,
          status: "Bad Request",
          message: "User ID not found in token.",
        });
      }

      const reserves = await this.reserveService.getAllReserves(
        userId,
        req.query,
      );

      res.status(200).json(reserves);
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

  async getReserveById(req: Request, res: Response) {
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

      const userId =
        (decoded as any).userId || (decoded as any).id || (decoded as any).sub;

      if (!userId) {
        return res.status(400).json({
          code: 400,
          status: "Bad Request",
          message: "User ID not found in token.",
        });
      }

      const reserve = await this.reserveService.getReserveById(id, userId);

      if (!reserve) {
        return res.status(404).json({
          code: 404,
          status: "Not Found",
          message:
            "This reserve does not exist or does not belong to the user.",
        });
      }

      const formattedReserve = {
        id: reserve.id,
        startDate: reserve.startDate,
        endDate: reserve.endDate,
        finalValue: reserve.finalValue,
        userId: reserve.userId,
        carId: reserve.carId,
      };

      return res.status(200).json(formattedReserve);
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

  async updateReserve(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id); 

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
          return jwt.verify(
            token,
            "njnckmlazlnxidih83934g5j90vniejincb89233hjn2ivcieonihyvtzftg9xsinmc",
          ) as { id: number };
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

      const userId =
        (decoded as any).userId || (decoded as any).id || (decoded as any).sub;
      if (!userId) {
        return res.status(400).json({
          code: 400,
          status: "Bad Request",
          message: "User ID not found in token.",
        });
      }

      const { startDate, endDate, carId } = req.body;
      if (!startDate || !endDate || !carId) {
        return res.status(400).json({
          code: 400,
          status: "Bad Request",
          message: "Start date, end date, and car ID are required.",
        });
      }

      const newReserveData = { startDate, endDate, carId };

      const updatedReserve = await this.reserveService.updateReserve(
        id,
        userId,
        newReserveData,
      );

      if (!updatedReserve) {
        return res.status(404).json({
          code: 404,
          status: "Not Found",
          message:
            "This reserve does not exist or does not belong to the user.",
        });
      }

      const formattedReserve = {
        id: updatedReserve.id,
        startDate: updatedReserve.startDate,
        endDate: updatedReserve.endDate,
        finalValue: updatedReserve.finalValue,
        carId: updatedReserve.carId.id,
        userId: updatedReserve.userId.id,
      };

      return res.status(200).json(formattedReserve);
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

  async deleteReserve(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id); 
      if (isNaN(id)) {
          return res.status(400).json({
              code: 400,
              status: "Bad Request",
              message: "Invalid reservation ID.",
          });
      }

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
              return jwt.verify(
                  token,
                  "njnckmlazlnxidih83934g5j90vniejincb89233hjn2ivcieonihyvtzftg9xsinmc"
              ) as { id: number };
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

      const userId = (decoded as any).userId || (decoded as any).id || (decoded as any).sub; 
      if (!userId) {
          return res.status(400).json({
              code: 400,
              status: "Bad Request",
              message: "User ID not found in token.",
          });
      }

      await this.reserveService.deleteReserve(id, userId);

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
