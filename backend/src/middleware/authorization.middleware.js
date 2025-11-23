"use strict";

import jwt from "jsonwebtoken";
import { handleErrorClient, handleErrorServer } from "../handlers/responseHandlers.js";

export function getUserRole(req) {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.error("No se provee el header de autorización.");
    return null;
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    return payload.role;
  } catch (error) {
    // Token invalido o expirado
    return null;
  }
}

// Utilizado para mostrar el nombre del rol en el mensaje
const roleNames = {
  administrador: "Administrador",
  jefe_carrera: "Jefe de Carrera",
  docente: "Docente",
  alumno: "Alumno",
};

export function verifyRoles(roles) {
  return (req, res, next) => {
    try {
      const userRole = getUserRole(req);

      if (!userRole) return handleErrorClient(res, 401, "Token inválido o expirado");

      if (!roles.includes(userRole)) {
        const validRolesNames = roles.map((role) => roleNames[role]).join(", ");

        return handleErrorClient(res, 403, `Acceso denegado: se necesitan privilegios de ${validRolesNames}`)
      }

      next();
    } catch (error) {
      return handleErrorServer(res, 500, "Error interno del servidor", error);
    }
  };
}
