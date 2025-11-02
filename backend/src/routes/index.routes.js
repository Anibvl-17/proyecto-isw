import { Router } from "express";

export function routerApi(app) {
  const router = Router();
  app.use("/api", router);
}
