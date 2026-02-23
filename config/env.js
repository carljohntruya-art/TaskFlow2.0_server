require('dotenv').config();

const requiredEnvVars = [
  'PORT',
  'NODE_ENV',
  'JWT_SECRET',
  'JWT_EXPIRES_IN',
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Error: Environment variable ${envVar} is missing.`);
    process.exit(1);
  }
}

if (!process.env.DATABASE_URL && (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.DB_NAME)) {
  console.error(`Error: Database configuration is missing. Provide DATABASE_URL or DB config.`);
  process.exit(1);
}

module.exports = {
  PORT: process.env.PORT,
  NODE_ENV: process.env.NODE_ENV,
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_NAME: process.env.DB_NAME,
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
  FRONTEND_ORIGIN: process.env.FRONTEND_ORIGIN || process.env.FRONTEND_URL || 'http://localhost:3000'
};
