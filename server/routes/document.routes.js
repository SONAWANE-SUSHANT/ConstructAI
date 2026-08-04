import { Router } from "express";
import * as documentController from "../controllers/document.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { uploadDocument } from "../middlewares/upload.middleware.js";

const router = Router();

router.use(authenticate);

router.get("/project/:projectId", documentController.listProjectDocuments);
router.post("/project/:projectId", uploadDocument.single("file"), documentController.uploadProjectDocument);
router.get("/:id", documentController.getDocument);
router.get("/:id/view", documentController.viewDocument);
router.get("/:id/download", documentController.downloadDocument);
router.delete("/:id", documentController.deleteDocument);

export default router;
