"use strict";

import { ElectiveEntity } from "../entities/elective.entity.js";
import { AppDataSource } from "../config/configDb.js";
import {
    handleErrorClient,
    handleErrorServer
} from "../handlers/responseHandlers.js";
import { checkInscriptionPeriod } from "../services/periodo.service.js";
import { electiveBodyValidation } from "../validations/elective.validation.js";

export async function getAllElectives(req, res) {
    try {
        const electiveRepository = AppDataSource.getRepository(ElectiveEntity);
        const userRole = req.user.role;

        let queryOptions = {
            order: {
                createdAt: "DESC"
            }
        };

        //Filtrar electivos según rol
        //Jefe de carrera puede ver todos los electivos(independientemente del estado)
        if (userRole === "jefe_carrera") {
            
        } else if (userRole === "docente") {
            queryOptions.where = [
                { teacherRut: req.user.rut },
                { status: "Aprobado" } //Docente ve sus propios electivos y los aprobados
            ];
        } else if (userRole === "alumno") {
            queryOptions.where = {
                status: "Aprobado" //Alumno solo ve electivos aprobados
            };
        } else {
            queryOptions.where = {
                status: "Aprobado" //Otros roles solo ven electivos aprobados
            };
        }
        
        const electives = await electiveRepository.find(queryOptions);
        
        res.status(200).json({ 
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
        
        res.status(200).json({ message: "Electivo encontrado:", data: elective });
    } catch (error) {
        return handleErrorServer(res, 500, error.message);
    }
}

export async function createElective(req, res) {
    try {
        const { error, value } = electiveBodyValidation.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });
        
        if (error) {
            const errorMessages = error.details.map(detail => detail.message);
            return handleErrorClient(
                res, 
                400, 
                "Error de validación", 
                errorMessages.join(", ")
            );
        }
        
        const {
            name,
            description,
            objectives,
            prerrequisites,
            schedule,
            quotas
        } = value;
        
        const inscriptionPeriodActive = await checkInscriptionPeriod();
        
        if (!inscriptionPeriodActive) {
            return handleErrorClient(
                res, 
                403, 
                "El período de inscripción ha finalizado. No es posible crear electivos."
            );
        }
        
        if (req.user.role !== "docente") {
            return handleErrorClient(
                res, 
                403, 
                "Solo los docentes pueden crear electivos."
            );
        }
        
        const electiveRepository = AppDataSource.getRepository(ElectiveEntity);
        
        const newElective = electiveRepository.create({
            name,
            description,
            objectives,
            prerrequisites,
            schedule,
            quotas,
            status: "Pendiente",
            teacherRut: req.user.rut
        });
        
        await electiveRepository.save(newElective);
        
        res.status(201).json({
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
        
        const updateSchema = electiveBodyValidation.fork(
            ["name", "description", "objectives", "schedule", "quotas"],
            (schema) => schema.optional()
        );
        
        const { error, value } = updateSchema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });
        
        if (error) {
            const errorMessages = error.details.map(detail => detail.message);
            return handleErrorClient(
                res, 
                400, 
                "Error de validación", 
                errorMessages.join(", ")
            );
        }
        
        const inscriptionPeriodActive = await checkInscriptionPeriod();
        
        if (!inscriptionPeriodActive) {
            return handleErrorClient(
                res, 
                403,
                "El período de inscripción ha finalizado. No es posible modificar electivos."
            );
        }
        
        const electiveRepository = AppDataSource.getRepository(ElectiveEntity);
        
        const elective = await electiveRepository.findOne({
            where: { id: parseInt(id) }
        });
        
        if (!elective) {
            return handleErrorClient(res, 404, "Electivo no encontrado.");
        }
        
        if (elective.teacherRut !== req.user.rut) {
            return handleErrorClient(
                res, 
                403, 
                "No tienes permiso para modificar este electivo."
            );
        }
        
        if (value.name !== undefined) elective.name = value.name;
        if (value.description !== undefined) elective.description = value.description;
        if (value.objectives !== undefined) elective.objectives = value.objectives;
        if (value.prerrequisites !== undefined) elective.prerrequisites = value.prerrequisites;
        if (value.schedule !== undefined) elective.schedule = value.schedule;
        if (value.quotas !== undefined) elective.quotas = value.quotas;
        
        await electiveRepository.save(elective);
        
        return res.status(200).json({ 
            message: "Electivo actualizado exitosamente.", 
            data: elective 
        });
    } catch (error) {
        console.error("Error al actualizar electivo:", error);
        return handleErrorServer(res, 500, error.message);
    }
}

export async function deleteElective(req, res) {
    try {
        const { id } = req.params;
        
        const inscriptionPeriodActive = await checkInscriptionPeriod();
        
        if (!inscriptionPeriodActive) {
            return handleErrorClient(
                res, 
                403,
                "El período de inscripción ha finalizado. No es posible eliminar electivos."
            );
        }
        
        const electiveRepository = AppDataSource.getRepository(ElectiveEntity);
        
        const elective = await electiveRepository.findOne({
            where: { id: parseInt(id) }
        });
        
        if (!elective) {
            return handleErrorClient(res, 404, "Electivo no encontrado.");
        }
        
        if (elective.teacherRut !== req.user.rut) {
            return handleErrorClient(
                res, 
                403, 
                "No tienes permiso para eliminar este electivo."
            );
        }
        
        await electiveRepository.delete({ id: parseInt(id) });
        
        res.status(200).json({ 
            message: "Electivo eliminado exitosamente." 
        });
    } catch (error) {
        console.error("Error al eliminar electivo:", error);
        return handleErrorServer(res, 500, error.message);
    }
}



