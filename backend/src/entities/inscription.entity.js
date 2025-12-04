"use strict";

import { EntitySchema } from "typeorm";

export const Inscription = new EntitySchema({
    name: "Inscripcion",
    tableName: "inscripciones",
    columns: {
        id: {
            type: "int",
            primary: true,
            generated: true,
        },
        userId: {
            type: "int",
            nullable: false,
        },
        electiveId: {
            type: "int",
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
            nullable: true,
        },
        reviewedAt: {
            type: "timestamp",
            nullable: true,
            default: null
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
