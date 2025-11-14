"use strict";

import { User } from "../entities/user.entity.js";
import { AppDataSource } from "./configDb.js";
import bcrypt from "bcrypt";

export async function createInitialUser() {
  try {
    const userRepository = AppDataSource.getRepository(User);

    const userCount = await userRepository.count();
    if (userCount > 0) return;

    const adminUser = {
      username: "Administrador",
      email: "admin@gmail.com",
      rut: "10200300-0",
      password: await bcrypt.hash("@dmin.2025", 10),
      role: "administrador"
    };

    await userRepository.save(userRepository.create(adminUser));
    console.log("=> Usuario administrador creado exitosamente");
    
  } catch (error) {
    console.error("Error al crear usuario inicial:", error);
    process.exit(1);
  }
}