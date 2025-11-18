import Joi from "joi";

export const createRequestBodyValidation = Joi.object({
  electiveId: Joi.number().required().integer().min(0).messages({
    "any.required": "El ID del electivo es obligatorio.",
    "number.base": "El ID del electivo debe ser un número.",
    "number.integer": "El ID del electivo debe ser un número entero.",
    "number.min": "El ID del electivo debe ser un entero positivo.",
  }),
  description: Joi.string().trim().required().min(5).max(300).messages({
    "any.required": "La descripción es obligatoria.",
    "string.base": "La descripción debe ser de tipo String.",
    "string.empty": "La descripción no puede estar vacía.",
    "string.min": "La descripción debe contener al menos 5 caracteres.",
    "string.max": "La descripción puede contener hasta 300 caracteres.",
  }),
})
  .unknown(false)
  .options({ abortEarly: false })
  .messages({ "object.unknown": "No se permiten campos adicionales." });

export const reviewRequestValidation = Joi.object({
  status: Joi.string()
    .required()
    .lowercase()
    .valid("aprobado", "rechazado", "pendiente")
    .messages({
      "any.required": "El estado es obligatorio.",
      "any.only": 'Solo se permiten estados "aprobado", "rechazado" y "pendiente"',
      "string.lowercase": "El estado debe estar en minúsculas",
    }),
  reviewerId: Joi.number().required().integer().min(0).messages({
    "any.required": "El ID del revisor es obligatorio.",
    "number.base": "El ID del revisor debe ser un número.",
    "number.integer": "El ID del revisor debe ser un número entero.",
    "number.min": "El ID del revisor debe ser un entero positivo.",
  }),
  reviewComment: Joi.string()
    .trim()
    .min(5)
    .max(300)
    .when("status", {
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
