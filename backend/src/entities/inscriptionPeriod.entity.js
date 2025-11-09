"use strict";

import { EntitySchema } from "typeorm";

export const InscriptionPeriodEntity = new EntitySchema({
    name: "InscriptionPeriod",
    tableName: "inscription_periods",
    columns: {
        id: {
            type: Number,
            primary: true,
            generated: true,
        },
        name: {
            type: String,
            nullable: false,
            comment: "Semeste 2-2025"
        },
        startDate: {
            type: "timestamp",
            nullable: false,
        },
        endDate: {
            type: "timestamp",
            nullable: false,
        },
        isActive: {
            type: Boolean,
            default: true,
            nullable: false,
        },
        academicYear: {
            type: String,
            nullable: false,
        },
        semester: {
            type: Number,
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