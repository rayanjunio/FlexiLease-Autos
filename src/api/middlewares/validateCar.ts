import { NextFunction } from "express";
import { Request, Response } from "express";
import Joi from "joi";

const accessorySchema = Joi.object({
  name: Joi.string().required(),
});

const carSchema = Joi.object({
  model: Joi.string().required(),
  color: Joi.string().required(),
  year: Joi.number().integer().min(1950).max(2023).required(),
  valuePerDay: Joi.number().positive().required(),
  accessories: Joi.array()
    .items(accessorySchema)
    .min(1)
    .required(),
  numberOfPassengers: Joi.number().integer().positive().required(),
});

export const validateCar = (req: Request, res: Response, next: NextFunction) => {
    const { error } = carSchema.validate(req.body);
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(", ");
      return res.status(400).json({
        code: 400,
        status: "Bad Request",
        message: errorMessage,
      });
    }
    next();
  };