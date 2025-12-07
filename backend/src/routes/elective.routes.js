"use strict";

import { Router } from "express";
import { authenticateJwt } from "../middleware/authentication.middleware.js";
import {
    getAllElectives,
    getElectiveById,
    createElective,
    updateElective,
    deleteElective,
    updateElectiveStatus, 
} from "../controllers/elective.controller.js";

const router = Router();


router.use(authenticateJwt);

router.get("/", getAllElectives);                    
router.get("/:id", getElectiveById);                 
router.post("/", createElective);                    
router.patch("/:id", updateElective);                
router.delete("/:id", deleteElective);               
router.patch("/:id/status", updateElectiveStatus);   

export default router;