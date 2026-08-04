import { Router } from "express";
import * as projectController from "../controllers/project.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { projectRules } from "../utils/validators.js";

const router = Router();

router.use(authenticate);

router.get("/", projectController.listProjects);
router.post("/", validate(projectRules), projectController.createProject);
router.get("/:id", projectController.getProject);
router.put("/:id", validate(projectRules), projectController.updateProject);
router.delete("/:id", projectController.deleteProject);

export default router;
