"use strict";

import Joi from "joi";

const timeFormat = Joi.string()
    .pattern(/^([01]\d|2[0-3]):[0-5]\d$/)
    .messages({
        "string.pattern.base": "El formato de hora debe ser HH:MM",
    });

const validWeekDays = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

const scheduleEntrySchema = Joi.object({
    day: Joi.string()
        .valid(...validWeekDays)
        .required()
        .messages({
            "any.only": "Día inválido. Días válidos: Lunes a Sábado",
            "any.required": "El día es obligatorio"
        }),
    startTime: timeFormat.required().messages({
        "any.required": "La hora de inicio es obligatoria",
        "string.empty": "La hora de inicio no puede estar vacía",
    }),
    endTime: timeFormat.required().messages({
        "any.required": "La hora de fin es obligatoria",
        "string.empty": "La hora de fin no puede estar vacía",
    }),
});

export const electiveBodyValidation = Joi.object({
    name: Joi.string().min(3).max(255).required().messages({
        "string.empty": "El nombre no puede estar vacío",
        "string.min": "El nombre debe tener al menos 3 caracteres",
        "string.max": "El nombre no puede tener más de 255 caracteres",
        "any.required": "El nombre es obligatorio"
    }),
    description: Joi.string().min(10).max(1000).required().messages({
        "string.empty": "La descripción no puede estar vacía",
        "string.min": "La descripción debe tener al menos 10 caracteres",
        "string.max": "La descripción no puede exceder los 1000 caracteres",
        "any.required": "La descripción es obligatoria"
    }),
    objectives: Joi.string().min(10).max(1000).required().messages({
        "string.empty": "Los objetivos no pueden estar vacíos",
        "string.min": "Los objetivos deben tener al menos 10 caracteres",
        "string.max": "Los objetivos no pueden exceder los 1000 caracteres",
        "any.required": "Los objetivos son obligatorios"
    }),
    prerrequisites: Joi.string().allow(null, "").max(255).optional().messages({
        "string.base": "Los prerrequisitos deben ser de tipo texto",
        "string.max": "Los prerrequisitos no pueden exceder los 500 caracteres"

    }),
    schedule: Joi.array()
        .items(scheduleEntrySchema)
        .min(1)
        .unique((a, b) => a.day === b.day)
        .required()
        .messages({
            "array.base": "El horario debe ser un arreglo",
            "array.min": "Debe seleccionar al menos 1 día de clase",
            "array.unique": "No puede repetir el mismo día",
            "any.required": "El horario es obligatorio",
        }),
    quotas: Joi.number().integer().min(1).max(200).required().messages({
        "number.base": "Los cupos deben ser un número",
        "number.integer": "Los cupos deben ser un número entero",
        "number.min": "Debe haber al menos 1 cupo",
        "number.max": "No puede haber más de 200 cupos",
        "any.required": "Los cupos son obligatorios"
    }),
})
    .custom((value, helpers) => {
        if (value.schedule && Array.isArray(value.schedule)) {
            for (const entry of value.schedule) {
                const [startHour, startMin] = entry.startTime.split(":").map(Number);
                const [endHour, endMin] = entry.endTime.split(":").map(Number);
                const startMinutes = startHour * 60 + startMin;
                const endMinutes = endHour * 60 + endMin;

                if (endMinutes <= startMinutes) {
                    return helpers.error("custom.endTimeBeforeStart", { day: entry.day });
                }

                if (endMinutes - startMinutes < 30) {
                    return helpers.error("custom.minimumDuration", { day: entry.day });
                }
            }
        }

        return value;
    })
    .messages({
        "custom.endTimeBeforeStart": "La hora de fin debe ser posterior a la hora de inicio",
        "custom.minimumDuration": "La clase debe durar al menos 30 minutos",
    })
    .options({
        stripUnknown: true,
    });

export const electiveStatusValidation = Joi.object({
    status: Joi.string()
        .valid("Aprobado", "Rechazado")
        .required()
        .messages({
            "any.only": "El estado debe ser 'Aprobado' o 'Rechazado'",
            "any.required": "El estado es obligatorio"
        }),

    rejectReason: Joi.string()
        .min(5)
        .max(300)
        .when("status", {
            is: "Rechazado",
            then: Joi.required(),
            otherwise: Joi.optional()
        })
        .messages({
            "string.empty": "El motivo de rechazo no puede estar vacío",
            "string.min": "El motivo de rechazo debe tener al menos 5 caracteres",
            "string.max": "El motivo de rechazo no puede exceder los 300 caracteres",
            "any.required": "El motivo de rechazo es obligatorio cuando se rechaza un electivo"
        })
}).options({
    stripUnknown: true,
});