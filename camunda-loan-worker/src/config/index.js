require('dotenv').config();
const { logger } = require("camunda-external-task-client-js");

const config = {

    camunda: {
        baseUrl: process.env.CAMUNDA_BASE_URL || "http://localhost:8080/engine-rest",
        use: logger,
        asyncResponseTimeout: 10000,
        processKey: process.env.CAMUNDA_PROCESS_KEY || "Process_1f255lo",
    },


    db: {
        user: process.env.DB_USER || "postgres",
        host: process.env.DB_HOST || "localhost",
        database: process.env.DB_DATABASE || "camunda_db",
        password: process.env.DB_PASSWORD || "your_password",
        port: parseInt(process.env.DB_PORT || '5432', 10),
    },


    redis: {
        url: process.env.REDIS_URL || 'redis://localhost:6379'
    },

    aws:{
        ses:''
    },


    server: {
        port: parseInt(process.env.PORT || '3000', 10)
    }
};

module.exports = config;