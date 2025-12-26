"use strict";

import { EntitySchema } from "typeorm";

export const ElectiveEntity = new EntitySchema({
    name: "Elective",
    tableName: "electives",
    columns: {
        id: {
            type: "int",
            primary: true,
            generated: true,
        },
        teacherRut: {
            type: "varchar",
            length: 12,
            nullable: false,
        },
        name: {
            type: "varchar",
            length: 255,
            nullable: false,
        },
        description: {
            type: "text",
            nullable: false,
        },
        objectives: {
            type: "text",
            nullable: false,
        },
        prerrequisites: {
            type: "text",
            nullable: true,
        },
        schedule: {
            type: "simple-json",
            nullable: false,
            comment: "Array de objetos -> [{day: 'Lunes', startTime: '08:00', endTime: '10:00'}]"
        },
        quotas: {
            type: "int",
            nullable: false,
        },
        status: {
            type: "enum",
            enum: ["Pendiente", "Aprobado", "Rechazado"],
            default: "Pendiente",
            nullable: false,
        },
        createdAt: {
            type: "timestamp",
            createDate: true,
            default: () => "CURRENT_TIMESTAMP",
        },
        updatedAt: {
            type: "timestamp",
            default: () => "CURRENT_TIMESTAMP",
            updateDate: true,
        },
    },
});
