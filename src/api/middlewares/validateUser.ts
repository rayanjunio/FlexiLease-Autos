import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import { isEmailValid } from "../utils/validators/validateEmail";

const userSchema = Joi.object({
  name: Joi.string().required(),
  cpf: Joi.string().required(),
  birth: Joi.string()
    .pattern(/^\d{2}\/\d{2}\/\d{4}$/)
    .required(),
  cep: Joi.string().required(),
  email: Joi.string().required(),
  password: Joi.string().min(6).required(),
});

export const validateUser = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { error } = userSchema.validate(req.body);

  const { email } = req.body;

  if(!isEmailValid(email)) {
    const message = "Typed email is not valid";

    return res.status(400).json({
      code: 400,
      status: "Bad Request",
      message,
    });
  }

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
