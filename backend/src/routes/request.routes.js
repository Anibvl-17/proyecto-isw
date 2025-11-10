import { Router } from "express";
import {
  createRequest,
  getRequestById,
  getRequests,
  reviewRequest,
} from "../controllers/request.controller.js";

const router = Router();

router.get("/", getRequests);
router.get("/:id", getRequestById);

router.post("/", createRequest);

router.patch("/review/:id", reviewRequest);

export default router;
