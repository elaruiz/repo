import env from 'node-env-file';
env('./.env');

// DATABASE

export const DB_USERNAME = process.env.DB_USERNAME; 

export const DB_PASSWORD = process.env.DB_PASSWORD;

export const DB_NAME = process.env.DB_NAME;

export const DB_HOST = process.env.DB_HOST;

export const DB_PORT = process.env.DB_PORT;

// JWT AUTHENTICATION TOKEN

export const TOKEN_SECRET = process.env.TOKEN_SECRET;

// STRIPE API KEYS

export const STRIPE_PK = process.env.STRIPE_PK;

export const STRIPE_SK = process.env.STRIPE_SK;

// MAIL SERVICE

export const EMAIL_HOST = process.env.EMAIL_HOST;

export const EMAIL_PORT = process.env.EMAIL_PORT;

export const EMAIL_USER = process.env.EMAIL_USER;

export const EMAIL_PASSWORD =  process.env.EMAIL_PASSWORD;

export const EMAIL_ACCOUNT =  process.env.EMAIL_ACCOUNT;

// PAYPAL API KEYS

export const PAYPAL_ID = process.env.PAYPAL_ID;

export const PAYPAL_SECRET = process.env.PAYPAL_SECRET;

export const PAYPAL_MODE = process.env.NODE_ENV === "production" ? 'live' : 'sandbox';

// API PROCESSOR

export const API_PROCESSOR = process.env.API_PROCESSOR;

// API CATASTRO

export const API_CATASTRO = process.env.API_CATASTRO;

export const API_SCRAPPER = process.env.API_SCRAPPER;

// CLIENTE

export const CLIENTE_WEB = process.env.CLIENTE_WEB;
