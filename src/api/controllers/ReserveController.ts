import { Request, Response } from "express";
import { ValidationError } from "../errors/ValidationError";
import { ReserveService } from "../services/ReserveService";

export class ReserveController {
  constructor(private reserveService: ReserveService){}

  async createReserve(req: Request, res: Response) {
    try {
      const userId: number = req.userId as number;

      const { startDate, endDate, carId } = req.body;     

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
      const userId: number = req.userId as number;

      const limit = parseInt(req.query.limit as string, 10) || 10;
      const offset = parseInt(req.query.offset as string, 10) || 0;

      const { reserves, total } = await this.reserveService.getAllReserves(
        userId,
        req.query,
        limit,
        offset,
      );

      const totalPages = Math.ceil(total / limit);

      res.status(200).json({
        reserves,
        total,
        limit,
        offset,
        offsets: totalPages,
      });
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
      const userId: number = req.userId as number;

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

      const userId: number = req.userId as number;

      if (!userId) {
        return res.status(400).json({
          code: 400,
          status: "Bad Request",
          message: "User ID not found in token.",
        });
      }

      const { startDate, endDate, carId } = req.body;

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

      const userId: number = req.userId as number;

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
