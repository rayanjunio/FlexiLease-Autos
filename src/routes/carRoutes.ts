import { Router } from "express";
import { carController } from "../config/instances/carInstances";
import { authMiddleware } from "../api/middlewares/authMiddleware";
import { validateCar } from "../api/middlewares/validateCar";
import { validateAccessory } from "../api/middlewares/validateAccessorie";

const router = Router();

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
