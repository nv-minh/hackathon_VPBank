const { Pool } = require("pg");
const postgresConfig = require("../config").db;

console.log("🐘 Khởi tạo kết nối đến PostgreSQL...");

const pool = new Pool(postgresConfig);

pool.on('error', (err, client) => {
    console.error('Lỗi không mong muốn trên client PostgreSQL', err);
    process.exit(-1);
});

module.exports = pool;