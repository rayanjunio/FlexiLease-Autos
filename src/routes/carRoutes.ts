import { Router } from "express";
import { CarController } from "../api/controllers/CarController";
import { authMiddleware } from "../api/middlewares/authMiddleware";

const router = Router();
const carController = new CarController();

router.post(
  "/car",
  authMiddleware,
  carController.createCar.bind(carController),
);
router.get(
  "/car",
  authMiddleware,
  carController.getAllCars.bind(carController),
);

router.get(
  "/car/:id",
  authMiddleware,
  carController.getCarById.bind(carController),
);
router.put(
  "/car/:id",
  authMiddleware,
  carController.updateCar.bind(carController),
);
router.patch(
  "/car/:id",
  authMiddleware,
  carController.updateAccessories.bind(carController),
);
router.delete(
  "/car/:id",
  authMiddleware,
  carController.deleteCar.bind(carController),
);

export default router;
