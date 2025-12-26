"use strict";

import { AppDataSource } from "../config/configDb.js";
import { ElectiveEntity } from "../entities/elective.entity.js";

export async function createElectiveService(data) {
    const electiveRepository = AppDataSource.getRepository(ElectiveEntity);
    
    const newElective = electiveRepository.create({
        ...data,
        status: "Pendiente"
    });
    
    return await electiveRepository.save(newElective);
}

export async function getElectivesService() {
    const electiveRepository = AppDataSource.getRepository(ElectiveEntity);
    return await electiveRepository.find({
        order: {
            createdAt: "DESC"
        }
    });
}

export async function getElectiveByIdService(id) {
    const electiveRepository = AppDataSource.getRepository(ElectiveEntity);
    const elective = await electiveRepository.findOneBy({ id: parseInt(id) });
    
    if (!elective) {
        throw new Error("Electivo no encontrado");
    }
    
    return elective;
}

export async function updateElectiveService(id, data) {
    const electiveRepository = AppDataSource.getRepository(ElectiveEntity);
    const elective = await getElectiveByIdService(id);

    if (elective.status === "Rechazado" || elective.status === "Aprobado") {
        data.status = "Pendiente";
    }

    electiveRepository.merge(elective, data);
    return await electiveRepository.save(elective);
}

export async function deleteElectiveService(id) {
    const electiveRepository = AppDataSource.getRepository(ElectiveEntity);
    await getElectiveByIdService(id);
    const result = await electiveRepository.delete(id);
    
    if (result.affected === 0) {
        throw new Error("No se pudo eliminar el electivo");
    }
    
    return { message: "Electivo eliminado exitosamente" };
}

export async function changeElectiveStatusService(id, newStatus) {
    const electiveRepository = AppDataSource.getRepository(ElectiveEntity);
    const elective = await getElectiveByIdService(id);
    
    if (!["Aprobado", "Rechazado"].includes(newStatus)) {
        throw new Error("Estado inválido. Debe ser 'Aprobado' o 'Rechazado'");
    }
    
    elective.status = newStatus;
    return await electiveRepository.save(elective);
}