"use strict";

import { User } from "../entities/user.entity.js";
import { AppDataSource } from "./configDb.js";
import bcrypt from "bcrypt";

export async function createInitialUsers() {
  try {
    const userRepository = AppDataSource.getRepository(User);

    const userCount = await userRepository.count();
    if (userCount > 0) return;

    const users = [
      {
        username: "Administrador",
        email: "admin@gmail.com",
        rut: "10200300-0",
        password: await bcrypt.hash("@dmin.2025", 10),
        role: "administrador",
      },
      {
        username: "Alejandra Segura",
        email: "asegura@gmail.com",
        rut: "11222333-4",
        password: await bcrypt.hash("Alejandra123.", 10),
        role: "docente"
      },
      {
        username: "Brunny Troncoso",
        email: "btroncoso@gmail.com",
        rut: "11999111-0",
        password: await bcrypt.hash("Brunny123.", 10),
        role: "jefe_carrera"
      },
      {
        username: "Sebastián Medina",
        email: "smedina@gmail.com",
        rut: "20891000-k",
        password: await bcrypt.hash("Sebastian123.", 10),
        role: "alumno"
      }
    ];

    for (const user of users) {      
      await userRepository.save(userRepository.create(user));
    }
    console.log("=> Usuarios iniciales creado exitosamente");
  } catch (error) {
    console.error("Error al crear usuarios iniciales:", error);
    process.exit(1);
  }
}
