import { Router } from "express";
import { UserController } from "../api/controllers/UserController";

const router = Router();
const userController = new UserController();

router.post("/user", userController.createUser.bind(userController));

router.get("/user/:id", userController.getUserById.bind(userController));
router.put("/user/:id", userController.updateUser.bind(userController));
router.delete("/user/:id", userController.deleteUser.bind(userController));

export default router;
