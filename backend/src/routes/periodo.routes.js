import { Router } from "express";
import { 
  createPeriodo, 
  getPeriodos, 
  getPeriodoById, 
  updatePeriodo, 
  deletePeriodo,
  getActivePeriod 
} from "../controllers/periodo.controller.js";

// CORRECCIÓN: Ruta y nombre correctos del middleware
import { authenticateJwt } from "../middleware/authentication.middleware.js";

const router = Router();

// Usamos el middleware con el nombre correcto
router.use(authenticateJwt);

// Rutas generales
router.get("/", getPeriodos);
router.post("/", createPeriodo);

// Obtener periodo activo (antes de /:id para evitar conflictos)
router.get("/active", getActivePeriod); 

// Rutas específicas por ID
router.get("/:id", getPeriodoById);
router.put("/:id", updatePeriodo);
router.delete("/:id", deletePeriodo);

export default router;