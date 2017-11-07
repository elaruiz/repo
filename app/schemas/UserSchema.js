'use strict';

const Joi = require('joi');

// module.exports = {

export const createUserSchema = Joi.object({
    name: Joi.string().trim().required().options({
        language: {
          any: {
            required: 'Este campo es requerido',
            empty: 'Este campo no puede ser vacío'
          }
        }
      }),
    email: Joi.string().email().required().options({
        language: {
          any: {
            required: 'Este campo es requerido',
            empty: 'Este campo no puede ser vacío'
          },
          string:{
              email: 'Email invalido'
          }
        }
      }),
    password: Joi.string().required().options({
        language: {
          any: {
            required: 'Este campo es requerido',
            empty: 'Este campo no puede ser vacío'
          }
        }
      }),
      password2: Joi.string().valid(Joi.ref('password')).required().options({
          language: {
              any: {
                  allowOnly: 'Contraseñas deben coincidir',
                  required: 'Este campo es requerido',
                  empty: 'Este campo no puede ser vacío'
              }
          }
      })
});

export const checkUserSchema = Joi.object({
    email: Joi.string().email()
});

export const authenticateUserSchema = Joi.object({
        email: Joi.string().email().required().options({
            language: {
              any: {
                required: 'Este campo es requerido',
                empty: 'Este campo no puede ser vacío'
              },
              string:{
                  email: 'Email invalido'
              }
            }
          }),
        password: Joi.string().required().options({
            language: {
              any: {
                required: 'Este campo es requerido',
                empty: 'Este campo no puede ser vacío'
              }
            }
          })
    });

export const payloadSchema = Joi.object({
    name: Joi.string().trim().options({
        language: {
            any: {
                required: 'Este campo es requerido',
                empty: 'Este campo no puede ser vacío'
            }
        }
    }),
    email: Joi.string().email().options({
        language: {
            string:{
                email: 'Email invalido'
            },
            any: {
                required: 'Este campo es requerido',
                empty: 'Este campo no puede ser vacío'
            }
        }
      }),
    admin: Joi.boolean(),
    password: Joi.string(),
    password2: Joi.string().valid(Joi.ref('password')).options({ language: { any: { allowOnly: 'contraseñas debe coincidir' } } })
});

export const editUserPasswordSchema = Joi.object({
    password: Joi.string().required().options({
        language: {
            any: {
                required: 'Este campo es requerido',
                empty: 'Este campo no puede ser vacío'
            }
        }
    }),
    password2: Joi.string().required().options({
        language: {
            any: {
                required: 'Este campo es requerido',
                empty: 'Este campo no puede ser vacío'
            }
        }
    }),
    password3: Joi.string().valid(Joi.ref('password2')).required().options({
        language: {
            any: {
                allowOnly: 'Contraseñas deben coincidir',
                required: 'Este campo es requerido',
                empty: 'Este campo no puede ser vacío'
            }
        }
    })
});

export const editUserInfoSchema = Joi.object({
    name: Joi.string().trim().options({
        language: {
            any: {
                required: 'Este campo es requerido',
                empty: 'Este campo no puede ser vacío'
            }
        }
    }),
    email: Joi.string().email().options({
        language: {
            string:{
                email: 'Email invalido'
            },
            any: {
                required: 'Este campo es requerido',
                empty: 'Este campo no puede ser vacío'
            }
        }
    }),
});

// };
