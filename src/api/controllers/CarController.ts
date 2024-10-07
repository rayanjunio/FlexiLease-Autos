import { Request, Response } from "express";
import { CarService } from "../services/CarService";
import { ValidationError } from "../errors/ValidationError";
import { Car } from "../../database/entities/Car";

export class CarController {
  private carService = new CarService();

  async createCar(req: Request, res: Response) {
    try {
      const {
        model,
        color,
        year,
        valuePerDay,
        accessories,
        numberOfPassengers,
      } = req.body;

      const newCar = await this.carService.createCar(
        model,
        color,
        year,
        valuePerDay,
        accessories,
        numberOfPassengers,
      );

      const formattedCar = {
        id: newCar.id,
        model,
        color,
        year,
        valuePerDay,
        accessories,
        numberOfPassengers,
      };
      return res.status(201).json(formattedCar);
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

  async getAllCars(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string, 10) || 10; 
      const offset = parseInt(req.query.offset as string, 10) || 0; 

      const { cars, total } = await this.carService.getAllCars(req.query, limit, offset);
  
      const totalPages = Math.ceil(total / limit);

      res.status(200).json({
        car: cars,
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

  async getCarById(req: Request, res: Response) {
    const id = parseInt(req.params.id);

    try {
      const car = await this.carService.getCarById(id);
      return res.status(200).json(car);
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

  async updateCar(req: Request, res: Response) {
    try {
      const {
        model,
        color,
        year,
        valuePerDay,
        accessories,
        numberOfPassengers,
      } = req.body;
      const id = parseInt(req.params.id);

      const carData: Partial<Car> = {
        model,
        color,
        year,
        valuePerDay,
        accessories,
        numberOfPassengers,
      };

      const updatedCar = await this.carService.updateCar(id, carData);
      return res.status(200).json(updatedCar);
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

  async updateAccessories(req: Request, res: Response) {
    try {
      const accessoryName = req.body.name;
      if (!accessoryName || typeof accessoryName !== "string") {
        return res.status(400).json({
          code: 400,
          status: "Bad Request",
          message: "Accessory name cannot be empty",
        });
      }

      const accessoryData = { name: accessoryName };
      const id = parseInt(req.params.id);
      // Passando accessoryName como um objeto
      const updatedCar = await this.carService.updateAccessory(
        id,
        accessoryData,
      );
      return res.status(200).json(updatedCar);
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

  async deleteCar(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      await this.carService.deleteCar(id);

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
