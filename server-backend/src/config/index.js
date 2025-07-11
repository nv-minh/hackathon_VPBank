// /src/config/index.js
require('dotenv').config();

module.exports = {
    port: process.env.PORT || 3000,
    db: {
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_DATABASE,
        password: process.env.DB_PASSWORD,
        port: parseInt(process.env.DB_PORT || '5432'),
    },
    camunda: {
        restUrl: process.env.CAMUNDA_REST_URL,
        processKey: process.env.CAMUNDA_PROCESS_KEY,
    },
};