"use strict";

import { EntitySchema } from "typeorm";

export const InscripcionEntity = new EntitySchema({
    name: "Inscripcion",
    tableName: "inscripciones",
    columns: {
        id: {
            type: Number,
            primary: true,
            generated: true,
        },
        userId: {
            type: Number,
            nullable: false,
        },
        electiveId: {
            type: Number,
            nullable: false,
        },
        estado: {
            type: "enum",
            enum: ["pendiente", "aprobado", "rechazado"],
            default: "pendiente",
            nullable: false,
        },
        motivo_rechazo: {
            type: String,
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
    relations: {
            student: {
                type: "many-to-one",
                target: "User",
                joinColumn: {
                    name: "userId",
                },
                onDelete: "CASCADE",
            },
            elective: {
                type: "many-to-one",
                target: "Elective",
                joinColumn: {
                    name: "electiveId",
                },
                onDelete: "CASCADE",
            }
    }
});
