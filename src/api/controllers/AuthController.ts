import { Request, Response } from "express";
import { AuthService } from "../services/AuthService";
import { ValidationError } from "../errors/ValidationError";

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  async authenticate(req: Request, res: Response): Promise<Response> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        const message = "Email and password are required";
        throw new ValidationError(400, "Bad Request", message);
      }

      const token = await this.authService.createAuth(email, password);

      return res.status(200).json({
        token: token,
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(error.code).json({
          code: error.code,
          status: error.status,
          message: error.message,
        });
      }

      return res.status(500).json({
        code: 500,
        status: "Internal Server Error",
        message: "Something went wrong",
      });
    }
  }
}
