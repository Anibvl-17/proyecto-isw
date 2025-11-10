import { AppDataSource } from "../config/configDb.js";
import { Periodo } from "../entities/periodo.entity.js";

export async function createPeriodoService(data) {
    const periodoRepository = AppDataSource.getRepository(Periodo);
    const nuevoPeriodo = periodoRepository.create(data);
    return await periodoRepository.save(nuevoPeriodo);
}

export async function getPeriodosService() {
    const periodoRepository = AppDataSource.getRepository(Periodo);
    return await periodoRepository.find();
}

export async function getPeriodoByIdService(id) {
    const periodoRepository = AppDataSource.getRepository(Periodo);
    const periodo = await periodoRepository.findOneBy({ id: parseInt(id) });
    
    if (!periodo) {
        throw new Error("Período no encontrado");
    }
    
    return periodo;
}

export async function updatePeriodoService(id, data) {
    const periodoRepository = AppDataSource.getRepository(Periodo);
    const periodo = await getPeriodoByIdService(id);
    periodoRepository.merge(periodo, data);
    return await periodoRepository.save(periodo);
}

export async function deletePeriodoService(id) {
    const periodoRepository = AppDataSource.getRepository(Periodo);
    await getPeriodoByIdService(id);
    const result = await periodoRepository.delete(id);
    
    if (result.affected === 0) {
        throw new Error("No se pudo eliminar el período.");
    }
    
    return { message: "Período eliminado exitosamente" };
}

export async function checkInscriptionPeriod() {
    try {
        const periodoRepository = AppDataSource.getRepository(Periodo);
        const currentDate = new Date();
        
        const activePeriod = await periodoRepository
            .createQueryBuilder("periodo")
            .where("periodo.fechaInicio <= :currentDate", { currentDate })
            .andWhere("periodo.fechaCierre >= :currentDate", { currentDate })
            .andWhere("periodo.visible = :visible", { visible: true })
            .getOne();
        
        return activePeriod !== null;
    } catch (error) {
        console.error("Error al verificar período de inscripción:", error);
        return false;
    }
}

export async function checkInscriptionPeriodById(periodoId) {
    const periodo = await getPeriodoByIdService(periodoId);
    const currentDate = new Date();
    
    return currentDate >= periodo.fechaInicio && currentDate <= periodo.fechaCierre;
}
