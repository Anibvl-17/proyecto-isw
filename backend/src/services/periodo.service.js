import { AppDataSource } from "../config/configDb.js";
import { Periodo } from "../entities/periodo.entity.js";
import { LessThanOrEqual, MoreThanOrEqual, In } from "typeorm";

// Crear un nuevo periodo
export async function createPeriodoService(data) {
  const periodoRepository = AppDataSource.getRepository(Periodo);
  const nuevoPeriodo = periodoRepository.create(data);
  return await periodoRepository.save(nuevoPeriodo);
}

// Obtener todos los periodos (ordenados por fecha más reciente primero)
export async function getPeriodosService() {
  const periodoRepository = AppDataSource.getRepository(Periodo);
  return await periodoRepository.find({
    order: { fechaInicio: "DESC" },
  });
}

// Obtener un periodo por ID
export async function getPeriodoByIdService(id) {
  const periodoRepository = AppDataSource.getRepository(Periodo);
  const periodo = await periodoRepository.findOneBy({ id: parseInt(id) });
  if (!periodo) throw new Error("Período no encontrado");
  return periodo;
}

// Actualizar un periodo existente
export async function updatePeriodoService(id, data) {
  const periodoRepository = AppDataSource.getRepository(Periodo);
  const periodo = await getPeriodoByIdService(id);
  periodoRepository.merge(periodo, data);
  return await periodoRepository.save(periodo);
}

// Eliminar un periodo
export async function deletePeriodoService(id) {
  const periodoRepository = AppDataSource.getRepository(Periodo);
  await getPeriodoByIdService(id); // Verifica que exista
  const result = await periodoRepository.delete(id);
  if (result.affected === 0) throw new Error("No se pudo eliminar el período.");
  return { message: "Período eliminado exitosamente" };
}

// Verificar si hay periodo activo para ALUMNOS (inscribirse)
export async function checkInscriptionPeriod() {
  const periodoRepository = AppDataSource.getRepository(Periodo);
  const now = new Date();

  const periodoActivo = await periodoRepository.findOne({
    where: {
      fechaInicio: LessThanOrEqual(now),
      fechaCierre: MoreThanOrEqual(now),
      visibilidad: In(["alumnos", "todos"]),
    },
  });

  return !!periodoActivo;
}

// Verificar si hay periodo activo para DOCENTES (crear/editar electivos)
export async function checkTeacherPeriod() {
  const periodoRepository = AppDataSource.getRepository(Periodo);
  const now = new Date();

  const periodoActivo = await periodoRepository.findOne({
    where: {
      fechaInicio: LessThanOrEqual(now),
      fechaCierre: MoreThanOrEqual(now),
      visibilidad: In(["docentes", "todos"]),
    },
  });

  return !!periodoActivo;
}