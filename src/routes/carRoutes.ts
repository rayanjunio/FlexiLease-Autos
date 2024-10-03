import { Router } from "express";
import { CarController } from "../api/controllers/CarController";

const router = Router();
const carController = new CarController();

router.post("/car", carController.createCar.bind(carController));
router.get("/car", carController.getAllCars.bind(carController));

router.get("/car/:id", carController.getCarById.bind(carController));
router.put("/car/:id", carController.updateCar.bind(carController));
router.patch("/car/:id", carController.updateAccessories.bind(carController));
router.delete("/car/:id", carController.deleteCar.bind(carController));

export default router;
