import Joi from "joi";

export const periodoBodyValidation = Joi.object({
  nombre: Joi.string()
    .min(5)
    .max(255)
    .required()
    .messages({
      "string.min": "El nombre debe tener al menos 5 caracteres.",
      "string.empty": "El nombre es obligatorio.",
      "any.required": "El nombre es obligatorio.",
    }),

  fechaInicio: Joi.date()
    .iso()
    .required()
    .messages({
      "date.base": "La fecha de inicio debe ser una fecha válida (ISO).",
      "any.required": "La fecha de inicio es obligatoria.",
    }),

  fechaCierre: Joi.date()
    .iso()
    .greater(Joi.ref("fechaInicio")) 
    .required()
    .messages({
      "date.greater": "La fecha de cierre debe ser posterior a la fecha de inicio.",
      "any.required": "La fecha de cierre es obligatoria.",
    }),

  restriccionAño: Joi.number()
    .integer()
    .min(1)
    .max(6)
    .optional()
    .allow(null)
    .messages({
      "number.base": "La restricción de año debe ser un número entero.",
      "number.min": "El año mínimo es 1.",
      "number.max": "El año máximo es 6.",
    }),

  visibilidad: Joi.string()
    .valid("oculto", "alumnos", "docentes", "todos")
    .default("oculto") 
    .optional()
    .messages({
      "any.only": "La visibilidad debe ser: 'oculto', 'alumnos', 'docentes' o 'todos'.",
    }),
})
  .unknown(false)
  .messages({
    "object.unknown": "No se permiten propiedades adicionales en el cuerpo de la solicitud.",
  });