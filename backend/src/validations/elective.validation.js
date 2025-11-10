"use strict";

import Joi from "joi";

export const electiveBodyValidation = Joi.object({
    name: Joi.string().max(255).required().messages({
        "string.empty": "El nombre no puede estar vacío",
        "string.max": "El nombre no puede tener más de 255 caracteres",
        "any.required": "El nombre es obligatorio"
    }),
    description: Joi.string().min(10).required().messages({
        "string.empty": "La descripción no puede estar vacía",
        "string.min": "La descripción debe tener al menos 10 caracteres",
        "any.required": "La descripción es obligatoria"
    }),
    objectives: Joi.string().min(10).required().messages({
        "string.empty": "Los objetivos no pueden estar vacíos",
        "string.min": "Los objetivos deben tener al menos 10 caracteres",
        "any.required": "Los objetivos son obligatorios"
    }),
    prerrequisites: Joi.string().allow(null, "").optional().messages({
        "string.base": "Los prerrequisitos deben ser de tipo texto"
    }),
    schedule: Joi.string().min(5).max(255).required().messages({
        "string.empty": "El horario no puede estar vacío",
        "string.min": "El horario debe tener al menos 5 caracteres",
        "string.max": "El horario no puede tener más de 255 caracteres",
        "any.required": "El horario es obligatorio"
    }),
    quotas: Joi.number().integer().min(1).max(200).required().messages({
        "number.base": "Los cupos deben ser un número",
        "number.integer": "Los cupos deben ser un número entero",
        "number.min": "Debe haber al menos 1 cupo",
        "number.max": "No puede haber más de 200 cupos",
        "any.required": "Los cupos son obligatorios"
    })
}).options({
    stripUnknown: true
});
