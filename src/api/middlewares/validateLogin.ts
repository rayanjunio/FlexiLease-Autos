import { Request, Response, NextFunction } from "express";
import Joi from "joi";

const userSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  });

export const validateLogin = (req: Request, res: Response, next: NextFunction) => {
    const { error } = userSchema.validate(req.body);
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