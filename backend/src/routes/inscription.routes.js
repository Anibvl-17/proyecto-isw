import { Router } from "express";
import { authenticateJwt } from "../middleware/authentication.middleware.js";
import {
    createInscription,
    getInscription,
    getInscriptionId,
    deleteInscriptionId,
    updateStatus,
} from "../controllers/inscription.controller.js";

const router = Router();
router.use(authenticateJwt);

router.get("/", getInscription);
router.get("/:id", getInscriptionId);

router.post("/", createInscription);

router.delete("/:id", deleteInscriptionId);

router.patch("/status/:id", updateStatus);

export default router;
