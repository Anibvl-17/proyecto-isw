import Joi from "joi";

export const createInscriptionBodyValidation = Joi.object({
    userId: Joi.number()
        .required()
        .integer()
        .min(1)
        .messages({
            "any.required": "El ID del estudiante es obligatorio.",
            "number.base": "El ID del estudiante debe ser un número.",
            "number.integer": "El ID debe ser un número entero.",
            "number.min": "El ID debe ser un entero positivo.",
        }),
    electiveId: Joi.number()
        .required()
        .integer()
        .min(1)
        .messages({
            "any.required": "El ID del electivo es obligatorio.",
            "number.base": "El ID del electivo debe ser un número.",
            "number.integer": "El ID del electivo debe ser un número entero.",
            "number.min": "El ID del electivo debe ser un entero positivo.",
        }),
})
    .unknown(false)
    .options({ abortEarly: false })
    .messages({ "object.unknown": "No se permiten campos adicionales." });

export const updateStatusValidation = Joi.object({
    estado: Joi.string()
        .required()
        .lowercase()
        .valid("aprobado", "rechazado", "pendiente")
        .messages({
            "any.required": "El estado es obligatorio.",
            "any.only": 'Solo se permiten estados "aprobado", "rechazado" y "pendiente"',
            "string.lowercase": "El estado debe estar en minúsculas",
        }),
    motivo_rechazo: Joi.string()
        .trim()
        .min(5)
        .max(300)
        .when("estado", {
            is: "rechazado",
            then: Joi.required().messages({
                "any.required": "El comentario del revisor es obligatorio al rechazar la solicitud.",
            }),
        })
        .messages({
            "string.base": "El comentario del revisor debe ser de tipo String.",
            "string.min": "El comentario del revisor debe contener al menos 5 caracteres.",
            "string.max": "El comentario del revisor puede contener hasta 300 caracteres.",
        }),
})
    .unknown(false)
    .options({ abortEarly: false })
    .messages({ "object.unknown": "No se permiten campos adicionales." });