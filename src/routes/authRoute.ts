import { Router } from "express";
import { authController } from "../config/instances/authInstances";
import { validateLogin } from "../api/middlewares/validateLogin";

const router = Router();

router.post(
  "/auth",
  validateLogin,
  authController.authenticate.bind(authController),
);

export default router;
