import { Router } from "express";
import { CarController } from "../api/controllers/CarController";
import { authMiddleware } from "../api/middlewares/authMiddleware";
import { validateCar } from "../api/middlewares/validateCar";
import { validateAccessory } from '../api/middlewares/validateAccessorie';

const router = Router();
const carController = new CarController();

router.post(
  "/car",
  validateCar,
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
  validateCar,
  authMiddleware,
  carController.updateCar.bind(carController),
);

router.patch(
  "/car/:id",
  validateAccessory,
  authMiddleware,
  carController.updateAccessories.bind(carController),
);

router.delete(
  "/car/:id",
  authMiddleware,
  carController.deleteCar.bind(carController),
);

export default router;
