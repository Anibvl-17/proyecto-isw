"use strict";

import { ElectiveEntity } from "../entities/elective.entity.js";
import { AppDataSource } from "../config/configDb.js";
import {
    handleErrorClient,
    handleErrorServer,
} from "../handlers/responseHandlers.js";
import { electiveBodyValidation } from "../validations/elective.validation.js";
import { changeElectiveStatusService } from "../services/elective.service.js";
import { checkTeacherPeriod } from "../services/periodo.service.js";

export async function getAllElectives(req, res) {
    try {
        const electiveRepository = AppDataSource.getRepository(ElectiveEntity);
        const userRole = req.user.role;

        let queryOptions = {
            order: { createdAt: "DESC" }
        };

        if (userRole === "jefe_carrera" || userRole === "administrador") {
        } else if (userRole === "docente") {
            queryOptions.where = [
                { teacherRut: req.user.rut },
                { status: "Aprobado" }
            ];
        } else {
            queryOptions.where = { status: "Aprobado" };
        }

        const electives = await electiveRepository.find(queryOptions);

        return res.status(200).json({
            message: electives.length === 0 ? "No hay electivos disponibles." : "Electivos encontrados:",
            data: electives
        });
    } catch (error) {
        return handleErrorServer(res, 500, error.message);
    }
}

export async function getElectiveById(req, res) {
    try {
        const { id } = req.params;
        const electiveRepository = AppDataSource.getRepository(ElectiveEntity);

        const elective = await electiveRepository.findOne({
            where: { id: parseInt(id) }
        });

        if (!elective) {
            return handleErrorClient(res, 404, "Electivo no encontrado.");
        }

        return res.status(200).json({ message: "Electivo encontrado:", data: elective });
    } catch (error) {
        return handleErrorServer(res, 500, error.message);
    }
}

export async function createElective(req, res) {
    try {
        if (req.user.role !== "docente") {
            return handleErrorClient(res, 403, "Solo los docentes pueden crear electivos.");
        }

        const isPeriodActive = await checkTeacherPeriod();
        if (!isPeriodActive) {
            return handleErrorClient(res, 403, "No hay período activo para crear electivos en este momento.");
        }

        const { error, value } = electiveBodyValidation.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            const errorMessages = error.details.map(detail => detail.message);
            return handleErrorClient(res, 400, "Error de validación", errorMessages.join(", "));
        }

        const electiveRepository = AppDataSource.getRepository(ElectiveEntity);

        const newElective = electiveRepository.create({
            ...value,
            status: "Pendiente",
            teacherRut: req.user.rut
        });

        await electiveRepository.save(newElective);

        return res.status(201).json({
            message: "Electivo creado exitosamente. Estado: Pendiente de revisión",
            data: newElective
        });
    } catch (error) {
        console.error("Error al crear electivo:", error);
        return handleErrorServer(res, 500, error.message);
    }
}

export async function updateElective(req, res) {
    try {
        const { id } = req.params;

        const isPeriodActive = await checkTeacherPeriod();
        if (!isPeriodActive) {
            return handleErrorClient(res, 403, "El período de edición de electivos ha finalizado.");
        }

        const updateSchema = electiveBodyValidation.fork(
            ["name", "description", "objectives", "prerrequisites", "schedule", "quotas"],
            (schema) => schema.optional()
        );

        const { error, value } = updateSchema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            const errorMessages = error.details.map(detail => detail.message);
            return handleErrorClient(res, 400, "Error de validación", errorMessages.join(", "));
        }

        const electiveRepository = AppDataSource.getRepository(ElectiveEntity);
        const elective = await electiveRepository.findOne({ where: { id: parseInt(id) } });

        if (!elective) {
            return handleErrorClient(res, 404, "Electivo no encontrado.");
        }

        if (elective.teacherRut !== req.user.rut) {
            return handleErrorClient(res, 403, "No tienes permiso para modificar este electivo.");
        }

        const previousStatus = elective.status;

        if (elective.status === "Rechazado" || elective.status === "Aprobado") {
            elective.status = "Pendiente";
        }

        Object.assign(elective, value);
        await electiveRepository.save(elective);

        let statusMessage = "";

        if (previousStatus === "Aprobado" && elective.status === "Pendiente") {
            statusMessage = "Pendiente de revisión.";
        } else if (previousStatus === "Rechazado" && elective.status === "Pendiente") {
            statusMessage = "Pendiente de revisión.";
        }
            return res.status(200).json({
                message: "Electivo actualizado exitosamente. " + statusMessage,
                data: elective,
            });
    } catch (error) {
        console.error("Error al actualizar electivo:", error);
        return handleErrorServer(res, 500, error.message);
    }
}


export async function deleteElective(req, res) {
    try {
        const { id } = req.params;

        const isPeriodActive = await checkTeacherPeriod();
        if (!isPeriodActive) {
            return handleErrorClient(res, 403, "El período de gestión de electivos ha finalizado.");
        }

        const electiveRepository = AppDataSource.getRepository(ElectiveEntity);
        const elective = await electiveRepository.findOne({ where: { id: parseInt(id) } });

        if (!elective) {
            return handleErrorClient(res, 404, "Electivo no encontrado.");
        }

        if (elective.teacherRut !== req.user.rut && !["jefe_carrera", "administrador"].includes(req.user.role)) {
            return handleErrorClient(res, 403, "No tienes permiso para eliminar este electivo.");
        }

        await electiveRepository.delete({ id: parseInt(id) });

        return res.status(200).json({ message: "Electivo eliminado exitosamente." });
    } catch (error) {
        console.error("Error al eliminar electivo:", error);
        return handleErrorServer(res, 500, error.message);
    }
}


export async function updateElectiveStatus(req, res) {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!["jefe_carrera", "administrador"].includes(req.user.role)) {
            return handleErrorClient(res, 403, "Solo el jefe de carrera o administrador puede cambiar el estado.");
        }

        if (!["Aprobado", "Rechazado"].includes(status)) {
            return handleErrorClient(res, 400, "Estado inválido. Debe ser 'Aprobado' o 'Rechazado'.");
        }

        const elective = await changeElectiveStatusService(id, status);

        return res.status(200).json({
            message: `Electivo ${status.toLowerCase()} exitosamente.`,
            data: elective
        });
    } catch (error) {
        return handleErrorServer(res, 500, error.message);
    }
}