import Joi from "joi";

// Validación para crear y actualizar períodos
export const periodoBodyValidation = Joi.object({
  nombre: Joi.string()
    .min(5)
    .max(255)
    .required()
    .messages({
      "string.min": "El nombre debe tener al menos 5 caracteres.",
      "string.empty": "El nombre es obligatorio."
    }),
  fechaInicio: Joi.date()
    .iso() 
    .required()
    .messages({
      "date.base": "La fecha de inicio debe ser una fecha válida.",
      "any.required": "La fecha de inicio es obligatoria."
    }),
  fechaCierre: Joi.date()
    .iso()
    .min(Joi.ref('fechaInicio')) // La fecha de cierre debe ser posterior a la de inicio
    .required()
    .messages({
      "date.min": "La fecha de cierre debe ser posterior a la fecha de inicio.",
      "any.required": "La fecha de cierre es obligatoria."
    }),
  restriccionCarreras: Joi.array()
    .items(Joi.string())
    .optional()
    .allow(null), 
  restriccionAño: Joi.number()
    .integer()
    .min(1)
    .max(6)
    .optional()
    .allow(null), 
  visible: Joi.boolean()
    .optional() 
})
  .unknown(false) 
  .messages({
    "object.unknown": "No se permiten propiedades adicionales.",
  });


