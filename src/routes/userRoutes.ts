import { Router } from "express";
import { userController } from "../config/instances/userInstances";
import { authMiddleware } from "../api/middlewares/authMiddleware";
import { validateUser } from "../api/middlewares/validateUser";

const router = Router();

router.post(
  "/user",
  validateUser,
  userController.createUser.bind(userController),
);

router.get(
  "/user/:id",
  authMiddleware,
  userController.getUserById.bind(userController),
);
router.put(
  "/user/:id",
  authMiddleware,
  userController.updateUser.bind(userController),
);
router.delete(
  "/user/:id",
  authMiddleware,
  userController.deleteUser.bind(userController),
);

export default router;
