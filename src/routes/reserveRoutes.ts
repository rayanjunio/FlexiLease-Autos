import { Router } from "express";
import { ReserveController } from "../api/controllers/ReserveController";
import { authMiddleware } from "../api/middlewares/authMiddleware";

const router = Router();
const reserveController = new ReserveController();

router.post(
  "/reserve",
  authMiddleware,
  reserveController.createReserve.bind(reserveController),
);
router.get(
  "/reserve",
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
