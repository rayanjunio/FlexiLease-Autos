import { Request, Response, NextFunction } from "express";
import Joi from "joi";

const accessorySchema = Joi.object({
  name: Joi.string().required(),
});

export const validateAccessory = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { error } = accessorySchema.validate(req.body);
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
