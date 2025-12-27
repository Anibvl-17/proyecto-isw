"use strict";

import { ElectiveEntity } from "../entities/elective.entity.js";
import { Periodo } from "../entities/periodo.entity.js";
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
        role: "docente",
      },
      {
        username: "Valeria Beratto",
        email: "vberatto@gmail.com",
        rut: "11222555-1",
        password: await bcrypt.hash("Valeria123.", 10),
        role: "docente",
      },
      {
        username: "Brunny Troncoso",
        email: "btroncoso@gmail.com",
        rut: "11999111-0",
        password: await bcrypt.hash("Brunny123.", 10),
        role: "jefe_carrera",
      },
      {
        username: "Sebastián Medina",
        email: "smedina@gmail.com",
        rut: "20891000-k",
        password: await bcrypt.hash("Sebastian123.", 10),
        role: "alumno",
      },
      {
        username: "Carlos Gana",
        email: "cgana@gmail.com",
        rut: "21898000-5",
        password: await bcrypt.hash("Carlos123.", 10),
        role: "alumno",
      },
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

export async function createInitialPeriodo() {
  try {
    const periodoRepository = AppDataSource.getRepository(Periodo);

    const periodoCount = await periodoRepository.count();
    if (periodoCount > 0) return;

    const periodo = {
      nombre: "2025-2",
      fechaInicio: "2025-12-11T01:00:00.000Z", // 10 de diciembre 2025, a las 10 am en Chile
      fechaCierre: "2026-01-11T01:00:00.000Z", // 10 de enero 2026, a las 10 am en Chile
      visibilidad: "docentes",
    };

    await periodoRepository.save(periodoRepository.create(periodo));
    console.log("=> Período inicial creado exitosamente");
  } catch (error) {
    console.error("Error al crear período inicial:", error);
    process.exit(1);
  }
}

export async function createInitialElectives() {
  try {
    const electiveRepository = AppDataSource.getRepository(ElectiveEntity);

    const electiveCount = await electiveRepository.count();
    if (electiveCount > 0) return;

    const electives = [
      {
        name: "Programación Avanzada en PL/SQL",
        description: "Administración de base de datos con Oracle",
        objectives:
          "Comprender la administración y configuración de base de datos, aplicar buenas prácticas",
        prerrequisites: "Base de Datos",
        schedule: [
          { day: "Miércoles", startTime: "17:10", endTime: "18:30" },
          { day: "Miércoles", startTime: "14:00", endTime: "16:20" },
        ],
        quotas: 40,
        status: "Pendiente",
        teacherRut: "11222555-1",
      },
      {
        name: "Introducción a DevOps",
        description:
          "Aprender sobre CI/CD, contenedores y automatización para mejorar la entrega de software.",
        objectives:
          "Comprender fundamentos DevOps, diseñar pipelines CI/CD, usar Docker y aplicar buenas prácticas de despliegue y monitoreo.",
        prerrequisites: "Conocimientos básicos de Git y Linux.",
        schedule: [
          { day: "Lunes", startTime: "18:30", endTime: "20:00" },
          { day: "Jueves", startTime: "18:30", endTime: "20:00" },
        ],
        quotas: 25,
        status: "Aprobado",
        teacherRut: "11222333-4",
      },
      {
        name: "Ciberseguridad Aplicada",
        description:
          "Electivo enfocado en seguridad ofensiva y defensiva, vulnerabilidades comunes, hardening y prácticas seguras de desarrollo.",
        objectives:
          "Aplicar medidas de mitigación, realizar análisis básico de riesgos y fortalecer configuraciones.",
        prerrequisites: null,
        schedule: [
          { day: "Viernes", startTime: "12:40", endTime: "14:00" },
          { day: "Sábado", startTime: "11:10", endTime: "12:30" },
        ],
        quotas: 25,
        status: "Pendiente",
        teacherRut: "11222333-4",
      },
    ];

    for (const elective of electives) {
      await electiveRepository.save(electiveRepository.create(elective));
    }
    console.log("=> Electivos iniciales creados exitosamente");
  } catch (error) {
    console.error("Error al crear electivos iniciales:", error);
    process.exit(1);
  }
}
