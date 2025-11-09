import { EntitySchema } from "typeorm";

export const Periodo = new EntitySchema({
  name: "Periodo",
  tableName: "periodos",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: "increment",
    },
    nombre: {
      type: "varchar",
      length: 255,
      nullable: false,
      comment: "Nombre del periodo, ej: 'Inscripción Electivos 2025-1'"
    },
    fechaInicio: {
      type: "timestamp",
      nullable: false,
      comment: "Fecha y hora de inicio del periodo de inscripción"
    },
    fechaCierre: {
      type: "timestamp",
      nullable: false,
      comment: "Fecha y hora de cierre del periodo de inscripción"
    },
    // "restricciones académicas por carrera"
    restriccionCarreras: {
      type: "simple-array", // Guarda un array de strings, ej: ["ICINF", "IECI"]
      nullable: true,
      comment: "Array de carreras permitidas. Nulo si es para todas."
    },
    // "restricciones académicas por año"
    restriccionAño: {
      type: "int",
      nullable: true,
      comment: "Año académico mínimo requerido. Nulo si no hay restricción."
    },
    // "proporcionando visibilidad a los estudiantes"
    visible: {
      type: "boolean",
      default: false,
      comment: "Si es visible para los estudiantes"
    },
    created_at: {
      type: "timestamp",
      createDate: true,
      default: () => "CURRENT_TIMESTAMP",
    },
    updated_at: {
      type: "timestamp",
      updateDate: true,
      default: () => "CURRENT_TIMESTAMP",
    },
  },
});
