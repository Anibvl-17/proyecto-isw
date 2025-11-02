"use strict";

import dotenv from "dotenv";

dotenv.config();

export const HOST = process.env.HOST;
export const PORT = process.env.PORT;

export const DB_PORT = process.env.DB_PORT;
export const DB_USERNAME = process.env.DB_USERNAME;
export const PASSWORD = process.env.DB_PASSWORD;
export const DATABASE = process.env.DATABASE;

export const JWT_SECRET = process.env.JWT_SECRET;
export const COOKIE_KEY = process.env.COOKIE_KEY;