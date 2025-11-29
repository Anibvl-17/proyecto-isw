"use strict";

import { Router } from "express";
import { authenticateJwt } from "../middleware/authentication.middleware.js";
import {
    getAllElectives,
    getElectiveById,
    createElective,
    updateElective,
    deleteElective,
} from "../controllers/elective.controller.js";

const router = Router();

router.use(authenticateJwt);

router.get("/", getAllElectives);
router.get("/:id", getElectiveById);
router.post("/", createElective);
router.patch("/:id", updateElective);
router.delete("/:id", deleteElective);

export default router;


