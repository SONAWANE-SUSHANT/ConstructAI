import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { loginRules, profileRules, registerRules } from "../utils/validators.js";

const router = Router();

router.post("/register", validate(registerRules), authController.register);
router.post("/login", validate(loginRules), authController.login);
router.get("/profile", authenticate, authController.getProfile);
router.put("/profile", authenticate, validate(profileRules), authController.updateProfile);
router.post("/logout", authenticate, authController.logout);

export default router;
