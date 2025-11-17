import { Router } from "express";
import { authenticateJwt } from "../middleware/authentication.middleware.js";
import { isAdmin } from "../middleware/authorization.middleware.js";
import {
    createInscription,
    getInscription,
    getInscriptionId,
    deleteInscriptionId,
    updateStatus,
} from "../controllers/inscription.controller.js";

const router = Router();
router.use(authenticateJwt);

router.get("/", getInscription); // Docente y Alumno Segun sus inscripciones
router.get("/:id", getInscriptionId); // Alumno

router.post("/", createInscription); //Alumno y jefe de carrera

router.delete("/:id", deleteInscriptionId); //Alumno

router.patch("/status/:id", isAdmin, updateStatus); //Jefe de carrera

export default router;
