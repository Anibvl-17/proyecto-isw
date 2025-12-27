import { AppDataSource } from "../config/configDb.js";
import { Periodo } from "../entities/periodo.entity.js";
// Agregamos 'Not' a los imports
import { LessThanOrEqual, MoreThanOrEqual, In, Not } from "typeorm";

// Crear un nuevo periodo
export async function createPeriodoService(data) {
  const periodoRepository = AppDataSource.getRepository(Periodo);
  const nuevoPeriodo = periodoRepository.create(data);
  return await periodoRepository.save(nuevoPeriodo);
}

// Obtener todos los periodos
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

// Actualizar un periodo
export async function updatePeriodoService(id, data) {
  const periodoRepository = AppDataSource.getRepository(Periodo);
  const periodo = await getPeriodoByIdService(id);
  periodoRepository.merge(periodo, data);
  return await periodoRepository.save(periodo);
}

// Eliminar un periodo
export async function deletePeriodoService(id) {
  const periodoRepository = AppDataSource.getRepository(Periodo);
  await getPeriodoByIdService(id);
  const result = await periodoRepository.delete(id);
  if (result.affected === 0) throw new Error("No se pudo eliminar el período.");
  return { message: "Período eliminado exitosamente" };
}

// Verificar solapamiento de fechas 
export async function checkPeriodOverlapService(startDate, endDate, visibility, excludeId = null) {
    const periodoRepository = AppDataSource.getRepository(Periodo);
    
    const whereClause = {
        visibilidad: visibility, 
        fechaInicio: LessThanOrEqual(endDate),
        fechaCierre: MoreThanOrEqual(startDate)
    };

    if (excludeId) {
        whereClause.id = Not(parseInt(excludeId));
    }

    const overlappingPeriod = await periodoRepository.findOne({
        where: whereClause
    });

    return overlappingPeriod; 
}

// Verificar si hay periodo activo para ALUMNOS
export async function checkInscriptionPeriod() {
  const periodoRepository = AppDataSource.getRepository(Periodo);
  const now = new Date();

  const periodoActivo = await periodoRepository.findOne({
    where: {
      fechaInicio: LessThanOrEqual(now),
      fechaCierre: MoreThanOrEqual(now),
      visibilidad: "alumnos", 
    },
  });

  return !!periodoActivo;
}

// Verificar si hay periodo activo para DOCENTES 
export async function checkTeacherPeriod() {
  const periodoRepository = AppDataSource.getRepository(Periodo);
  const now = new Date();

  const periodoActivo = await periodoRepository.findOne({
    where: {
      fechaInicio: LessThanOrEqual(now),
      fechaCierre: MoreThanOrEqual(now),
      visibilidad: "docentes", 
    },
  });

  return !!periodoActivo;
}

// Obtiene TODOS los periodos activos para el rol
export async function getActivePeriodForRoleService(role) {
  const periodoRepository = AppDataSource.getRepository(Periodo);
  const now = new Date();

  let visibilidadArray = [];

  if (role === "alumno") {
    visibilidadArray.push("alumnos");
  } else if (role === "docente") {
    visibilidadArray.push("docentes");
  } else if (role === "jefe_carrera" || role === "administrador") {
    visibilidadArray = ["alumnos", "docentes"];
  }

  if (visibilidadArray.length === 0) return [];

  const periodosActivos = await periodoRepository.find({
    where: {
      fechaInicio: LessThanOrEqual(now),
      fechaCierre: MoreThanOrEqual(now),
      visibilidad: In(visibilidadArray),
    },
    order: { fechaCierre: "ASC" },
  });

  return periodosActivos;
}