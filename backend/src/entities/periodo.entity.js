"use strict";

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
      comment: "Nombre descriptivo del periodo",
    },
    fechaInicio: {
      type: "timestamp",
      nullable: false,
      comment: "Momento exacto en que inicia el periodo",
    },
    fechaCierre: {
      type: "timestamp",
      nullable: false,
      comment: "Momento exacto en que finaliza el periodo",
    },
    visibilidad: {
      type: "varchar", 
      default: "alumnos",
      nullable: false,
      comment: "Define el rol objetivo: 'alumnos' o 'docentes'",
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