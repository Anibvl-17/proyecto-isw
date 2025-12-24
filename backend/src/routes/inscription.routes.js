import { Router } from "express";
import { authenticateJwt } from "../middleware/authentication.middleware.js";
import { verifyRoles } from "../middleware/authorization.middleware.js";

import {
    createInscription,
    getInscription,
    getInscriptionId,
    deleteInscriptionId,
    updateStatus,
    getElectivesByPrerequisites
} from "../controllers/inscription.controller.js";

const router = Router();
router.use(authenticateJwt);

router.get("/", verifyRoles(["docente", "alumno"]), getInscription); 
router.get("/filter", verifyRoles(["alumno", "docente", "jefe_carrera"]), getElectivesByPrerequisites);
router.get("/:id", verifyRoles(["alumno"]), getInscriptionId);

router.post("/", verifyRoles(["alumno", "docente"]), createInscription); 

router.delete("/:id", verifyRoles(["alumno"]), deleteInscriptionId);

router.patch("/status/:id", verifyRoles(["docente"]), updateStatus); 

export default router;
