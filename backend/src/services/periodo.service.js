import { AppDataSource } from "../config/configDb.js";
import { Periodo } from "../entities/periodo.entity.js";

// Servicio para crear un nuevo periodo
export async function createPeriodoService(data) {
  const periodoRepository = AppDataSource.getRepository(Periodo);
  
  const nuevoPeriodo = periodoRepository.create(data);
  return await periodoRepository.save(nuevoPeriodo);
}

// Servicio para obtener todos los periodos
export async function getPeriodosService() {
  const periodoRepository = AppDataSource.getRepository(Periodo);
  return await periodoRepository.find();
}

// Servicio para obtener un periodo por ID
export async function getPeriodoByIdService(id) {
  const periodoRepository = AppDataSource.getRepository(Periodo);
  const periodo = await periodoRepository.findOneBy({ id: parseInt(id) });
  if (!periodo) {
    throw new Error("Período no encontrado");
  }
  return periodo;
}

// Servicio para actualizar un periodo
export async function updatePeriodoService(id, data) {
  const periodoRepository = AppDataSource.getRepository(Periodo);
  const periodo = await getPeriodoByIdService(id); // Reusa la función para verificar si existe

  // Mezcla los datos existentes con los nuevos
  periodoRepository.merge(periodo, data);
  return await periodoRepository.save(periodo);
}

// Servicio para eliminar un periodo
export async function deletePeriodoService(id) {
  const periodoRepository = AppDataSource.getRepository(Periodo);
  await getPeriodoByIdService(id); // Verifica si existe, si no, lanza error

  const result = await periodoRepository.delete(id);
  if (result.affected === 0) {
    throw new Error("No se pudo eliminar el período.");
  }
  return { message: "Período eliminado exitosamente" };
}
