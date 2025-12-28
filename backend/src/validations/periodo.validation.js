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
    .min("now") // <--- NUEVA REGLA: No permite fechas en el pasado
    .required()
    .messages({
      "date.base": "La fecha de inicio debe ser una fecha válida (ISO).",
      "date.min": "La fecha de inicio no puede ser anterior al día de hoy.",
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

  visibilidad: Joi.string()
    .valid("alumnos", "docentes")
    .required()
    .messages({
      "any.only": "La visibilidad debe ser: 'alumnos' o 'docentes'.",
      "any.required": "La visibilidad es obligatoria.",
    }),
})
  .unknown(true)
  .messages({
    "object.unknown": "No se permiten propiedades adicionales.",
  });