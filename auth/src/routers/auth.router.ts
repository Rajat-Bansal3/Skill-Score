import { Router } from "express";
import { AuthController } from "../controllers/index";
const router = Router();

router.post("/test", AuthController.test);
router.post("/signin", AuthController.signin);
router.post("/signup", AuthController.signup);

export default router;
