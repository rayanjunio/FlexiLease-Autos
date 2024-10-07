import { Router } from "express";
import { AuthController } from "../api/controllers/AuthController";

const router = Router();
const authController = new AuthController();

router.post("/auth", authController.authenticate.bind(authController));

export default router;
