const Joi = require('joi');

export const createPlanSchema = Joi.object({
    name: Joi.string().required().options({
        language: {
          any: {
            required: 'Este campo es requerido',
            empty: 'Este campo no puede ser vacío'
          }
        }
      }),
    description: Joi.string().required().options({
        language: {
          any: {
            required: 'Este campo es requerido',
            empty: 'Este campo no puede ser vacío'
          }
        }
      }),
    reports: Joi.number().integer().min(1).required().options({
        language: {
          any: {
            required: 'Este campo es requerido',
            empty: 'Este campo no puede ser vacío'
          },
          number: {
            min: 'Debe ser igual o mayor que {{limit}}',
            }
        }
      }),
    price: Joi.number().min(0).required().options({
        language: {
          any: {
            required: 'Este campo es requerido',
            empty: 'Este campo no puede ser vacío'
          },
          number: {
            min: 'Debe ser igual o mayor que {{limit}}',
            }
        }
      }),
    currency: Joi.string().uppercase().min(1).max(3).required().options({
        language: {
          any: {
            required: 'Este campo es requerido',
            empty: 'Este campo no puede ser vacío'
          }
        }
      }),
    interval_time: Joi.string().valid('month', 'year', 'week', 'day').required().options({
        language: {
          any: {
            required: 'Este campo es requerido',
            empty: 'Este campo no puede ser vacío'
          }
        }
      }),
    interval_count: Joi.number().integer().min(1).required().options({
        language: {
          any: {
            required: 'Este campo es requerido',
            empty: 'Este campo no puede ser vacío'
          },
          number: {
            min: 'Debe ser igual o mayor que {{limit}}',
         }
        }
      }),
});

export const updatePlanSchema = Joi.object({
    name: Joi.string(),
    description: Joi.string(),
    reports: Joi.number().integer().min(1).options({
        language: {
            number: {
                min: 'Debe ser igual o mayor que {{limit}}',
            }
        }
      }),
    price: Joi.number().min(0).options({
        language: {
          number: {
            min: 'Debe ser igual o mayor que {{limit}}',
            }
        }
      }),
    currency: Joi.string().uppercase().min(1).max(3),
    interval_time: Joi.string().valid('month', 'year', 'week', 'day'),
    interval_count: Joi.number().integer().min(1).options({
        language: {
          number: {
            min: 'Debe ser igual o mayor que {{limit}}',
            }
        }
      }),
});