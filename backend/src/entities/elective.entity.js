"use strict";

import { EntitySchema } from "typeorm";

export const ElectiveEntity = new EntitySchema({
    name: "Elective",
    tableName: "electives",
    columns: {
        id: {
            type: Number,
            primary: true,
            generated: true,
        },
        teacherRut: {
            type: String,
            nullable: false,
        },
        name: {
            type: String,
            nullable: false,
        },
        description: {
            type: String,
            nullable: false,
        },
        objectives: {
            type: String,
            nullable: false,
        },
        prerrequisites: {
            type: String,
            nullable: true,
        },
        schedule : {
            type: String,
            nullable: false,
        },
        quotas : {
            type: Number,
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
            default: () => "CURRENT_TIMESTAMP",
        },
        updatedAt: {
            type: "timestamp",
            default: () => "CURRENT_TIMESTAMP",
            onUpdate: "CURRENT_TIMESTAMP",
        },
    },
});