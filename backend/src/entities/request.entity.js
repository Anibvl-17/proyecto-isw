import { EntitySchema } from "typeorm";

export const Request = new EntitySchema({
  name: "Request",
  tableName: "requests",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: "increment"
    },
    studentId: {
      type: "int",
      nullable: false
    },
    electiveId: {
      type: "int",
      nullable: false
    },
    description: {
      type: "varchar",
      length: 300,
      nullable: false
    },
    status: {
      type: "enum",
      enum: ["aprobado", "rechazado", "pendiente"],
      default: "pendiente"
    },
    // Almacenara el id del jefe de carrera que revisa la solicitud
    reviewerId: {
      type: "int",
      nullable: true,
      default: null
    },
    // Para almacenar el motivo de rechazo de solicitud
    reviewComment: {
      type: "varchar",
      nullable: true,
      length: 300,
      default: null
    },
    // Fecha de revisión de solicitud
    reviewedAt: {
      type: "timestamp",
      nullable: true,
      default: null
    },
    createdAt: {
      type: "timestamp",
      createDate: true,
      default: () => "CURRENT_TIMESTAMP"
    },
    updatedAt: {
      type: "timestamp",
      updateDate: true,
      default: () => "CURRENT_TIMESTAMP"
    }
  },
  relations: {
    studentId: {
      type: "many-to-one",
      target: "User",
      joinColumn: {
        name: "userId",
      },
      onDelete: "CASCADE",
    },
    reviewerId: {
      type: "many-to-one",
      target: "User",
      joinColumn: {
        name: "reviewerId",
      },
      onDelete: "SET NULL",
    }
  }
});