import { Router } from "express";
import * as aiController from "../controllers/ai.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authenticate);
router.get("/readiness", aiController.getReadiness);

export default router;
