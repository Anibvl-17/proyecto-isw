"use strict";

import User from "../entities/user.entity.js";
import { AppDataSource } from "../config/configDb.js";

export async function isAdmin(req, res, next) {
    try {
        const userRepository = AppDataSource.getRepository(User);
        const userFound = await userRepository.findOneBy({
            email: req.user?.email,
        });
        if (!userFound)
            return res.status(404).json({ message: "Usuario no encontrado" });

        const userRole = userFound.role;

        if (userRole !== "administrador")
            return res.status(403).json({
                message: "Acceso denegado: se requieren privilegios de administrador"
            });

        next();
    } catch (error) {
        return res.status(500).json({ message: "Error interno del servidor", error });

    }
}
