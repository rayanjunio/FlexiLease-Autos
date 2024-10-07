import { Router } from "express";
import { AuthController } from "../api/controllers/AuthController";
import { validateLogin } from "../api/middlewares/validateLogin";

const router = Router();
const authController = new AuthController();

router.post("/auth", validateLogin, authController.authenticate.bind(authController));

export default router;
