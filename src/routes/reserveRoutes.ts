import { Router } from "express";
import { reserveController } from "../config/instances/reserveInstance";
import { authMiddleware } from "../api/middlewares/authMiddleware";
import { validateReserve } from "../api/middlewares/validateReserve";

const router = Router();

router.post(
  "/reserve",
  validateReserve,
  authMiddleware,
  reserveController.createReserve.bind(reserveController),
);
router.get(
  "/reserve",
  authMiddleware,
  reserveController.getAllReservesFromUser.bind(reserveController),
);

router.get(
  "/reserve/:id",
  authMiddleware,
  reserveController.getReserveById.bind(reserveController),
);
router.put(
  "/reserve/:id",
  authMiddleware,
  reserveController.updateReserve.bind(reserveController),
);
router.delete(
  "/reserve/:id",
  authMiddleware,
  reserveController.deleteReserve.bind(reserveController),
);

export default router;
