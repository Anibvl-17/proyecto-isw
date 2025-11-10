import { Router } from "express";
import authRoutes from "./auth.routes.js";
import periodoRoutes from "./periodo.routes.js";
import electiveRoutes from "./elective.routes.js";

export function routerApi(app) {
    const router = Router();
    app.use("/api", router);
    
    router.use("/auth", authRoutes);
    router.use("/periodos", periodoRoutes);
    router.use("/electives", electiveRoutes);
}

