import { Router } from "express";
import * as resourceController from "../controllers/resource.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authenticate);

router.get("/:type", resourceController.listResources);
router.post("/:type", resourceController.createResource);
router.put("/:type/:id", resourceController.updateResource);
router.delete("/:type/:id", resourceController.deleteResource);

export default router;
