import { Router } from "express";
import authRoutes from "./auth.routes.js";
import periodoRoutes from "./periodo.routes.js";
import electiveRoutes from "./elective.routes.js";
import inscriptionRoutes from "./inscription.routes.js";
import requestRoutes from "./request.routes.js";
import userRoutes from "./user.routes.js";
import { verifyRoles } from "../middleware/authorization.middleware.js";

export function routerApi(app) {
    const router = Router();
    app.use("/api", router);
    
    router.use("/auth", authRoutes);
    router.use("/periodos", periodoRoutes);
    router.use("/electives", electiveRoutes);
    router.use("/inscription", inscriptionRoutes);
    router.use("/requests", verifyRoles(["jefe_carrera", "alumno"]), requestRoutes);
    router.use("/users", userRoutes);
}

