import { Router } from "express";
import { UserController } from "../api/controllers/UserController";
import { authMiddleware } from "../api/middlewares/authMiddleware";

const router = Router();
const userController = new UserController();

router.post("/user", userController.createUser.bind(userController));

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
