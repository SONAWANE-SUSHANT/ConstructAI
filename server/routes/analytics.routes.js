import { Router } from "express";
import * as analyticsController from "../controllers/analytics.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authenticate);

router.get("/dashboard", analyticsController.getDashboardStats);
router.get("/reports", analyticsController.getReports);

export default router;
