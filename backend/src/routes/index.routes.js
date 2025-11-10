import { Router } from "express";
import authRoutes from "./auth.routes.js";
import periodoRoutes from "./periodo.routes.js"; // <-- 1. IMPORTA TUS NUEVAS RUTAS
import requestRoutes from "./request.routes.js";

export function routerApi(app) {
  const router = Router();
  app.use("/api", router);

  router.use("/auth", authRoutes);
  router.use("/periodos", periodoRoutes); // <-- 2. REGISTRA TUS NUEVAS RUTAS
  router.use("/requests", requestRoutes);
}

