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
      comment: "Nombre del periodo, ej: 'Inscripción Electivos 2025-1'",
    },
    fechaInicio: {
      type: "timestamp",
      nullable: false,
      comment: "Fecha y hora de inicio del periodo de inscripción",
    },
    fechaCierre: {
      type: "timestamp",
      nullable: false,
      comment: "Fecha y hora de cierre del periodo de inscripción",
    },
    restriccionAño: {
      type: "int",
      nullable: true,
      comment: "Año académico mínimo requerido. Nulo si no hay restricción.",
    },
    visibilidad: {
      type: "enum",
      enum: ["oculto", "alumnos", "docentes", "todos"],
      default: "oculto",
      nullable: false,
      comment: "Quién puede ver este periodo: 'oculto' (nadie), 'alumnos', 'docentes' o 'todos'",
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