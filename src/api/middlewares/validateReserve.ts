import { Request, Response, NextFunction } from "express";
import Joi from "joi";

const reserveSchema = Joi.object({
  startDate: Joi.string()
    .pattern(/^\d{2}\/\d{2}\/\d{4}$/)
    .required(),
  endDate: Joi.string()
    .pattern(/^\d{2}\/\d{2}\/\d{4}$/)
    .required(),
  carId: Joi.number().integer().required(),
});

export const validateReserve = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { error } = reserveSchema.validate(req.body);
  if (error) {
    const errorMessage = error.details
      .map((detail) => detail.message)
      .join(", ");
    return res.status(400).json({
      code: 400,
      status: "Bad Request",
      message: errorMessage,
    });
  }
  next();
};
