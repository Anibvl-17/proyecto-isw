import { Router } from "express";
import { 
  createPeriodo, 
  getPeriodos, 
  getPeriodoById, 
  updatePeriodo, 
  deletePeriodo 
} from "../controllers/periodo.controller.js";

const router = Router();

// Crear un nuevo periodo
router.post("/", createPeriodo);

// Obtener todos los periodos
router.get("/", getPeriodos);

// Obtener un periodo específico por ID
router.get("/:id", getPeriodoById);

// Actualizar un periodo por ID
router.put("/:id", updatePeriodo);

// Eliminar un periodo por ID
router.delete("/:id", deletePeriodo);


export default router;
