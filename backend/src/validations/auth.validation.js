"use strict";

import Joi from "joi";

export const userRegisterBodyValidation = Joi.object({
    email: Joi.string()
        .email()
        .required()
        .messages({
            "string.email": "Debe ser un email válido",
            "string.empty": "El email no puede estar vacío",
            "any.required": "El email es obligatorio"
        }),
    rut: Joi.string()
        .pattern(/^\d{7,8}-[\dkK]$/)
        .required()
        .messages({
            "string.pattern.base": "El RUT debe tener formato 12345678-9 o 12345678-k",
            "string.empty": "El RUT no puede estar vacío",
            "any.required": "El RUT es obligatorio"
        }),
    password: Joi.string()
        .min(6)
        .required()
        .messages({
            "string.min": "La contraseña debe tener al menos 6 caracteres",
            "string.empty": "La contraseña no puede estar vacía",
            "any.required": "La contraseña es obligatoria"
        }),
    role: Joi.string()
        .valid("administrador", "jefe_carrera", "docente", "alumno")
        .optional()
        .default("alumno")
        .messages({
            "any.only": "El rol debe ser: administrador, jefe_carrera, docente o alumno"
        })
}).options({
    stripUnknown: true
});

export const userLoginBodyValidation = Joi.object({
    email: Joi.string()
        .email()
        .required()
        .messages({
            "string.email": "Debe ser un email válido",
            "string.empty": "El email no puede estar vacío",
            "any.required": "El email es obligatorio"
        }),
    password: Joi.string()
        .required()
        .messages({
            "string.empty": "La contraseña no puede estar vacía",
            "any.required": "La contraseña es obligatoria"
        })
}).options({
    stripUnknown: true
});
