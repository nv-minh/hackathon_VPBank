// function registerGetCustomerDataWorker(client) {
//     client.subscribe("getCustomerData", async ({ task, taskService }) => {
//         console.log(`⚡️ Nhận được tác vụ [getCustomerData]...`);
//
//         const fakeCustomerData = {
//             application_id: task.variables.get("applicationId") || 'app-fake-01',
//             customer_name: 'Nguyen Van Test',
//             credit_score: 750,
//             annual_salary: 90000000
//         };
//         console.log("✅ [TEST] Đã tạo dữ liệu khách hàng giả:", fakeCustomerData);
//
//         const processVariables = new Map();
//         processVariables.set("customerData", fakeCustomerData);
//
//         await taskService.complete(task, processVariables);
//     });
// }
//
// module.exports = registerGetCustomerDataWorker;



const { Pool } = require('pg');
const { createClient } = require('redis');
const config = require('../config');

const pool = new Pool(config.db);
const redisClient = createClient(config.redis);
(async () => {
    await redisClient.connect();
})();


function registerGetCustomerDataWorker(client) {
    client.subscribe("getCustomerData", async ({ task, taskService }) => {
        console.log(`⚡️ Nhận được tác vụ [getCustomerData]...`);
        const applicationId = task.variables.get("applicationId");

        if (!applicationId) {
            return await taskService.handleFailure(task, { errorMessage: "Thiếu applicationId." });
        }

        const cacheKey = `customer:${applicationId}`;

        try {
            // 1. Kiểm tra cache
            const cachedData = await redisClient.get(cacheKey);
            if (cachedData) {
                console.log("CACHE HIT! Lấy dữ liệu từ Redis.");
                const customerData = JSON.parse(cachedData);

                const processVariables = new Map();
                processVariables.set("customerData", customerData);
                await taskService.complete(task, processVariables);
                return;
            }

            console.log("CACHE MISS! Truy vấn từ PostgreSQL.");
            const query = 'SELECT * FROM loan_applications WHERE id = $1'; // Ví dụ query
            const { rows } = await pool.query(query, [applicationId]);

            if (rows.length === 0) {
                return await taskService.handleBpmnError(task, "CUSTOMER_NOT_FOUND", `Không tìm thấy đơn vay với id = ${applicationId}`);
            }

            const customerData = rows[0];

            await redisClient.set(cacheKey, JSON.stringify(customerData), { EX: 3600 });
            console.log("Đã lưu kết quả vào Redis.");

            const processVariables = new Map();
            processVariables.set("customerData", customerData);
            await taskService.complete(task, processVariables);

        } catch (error) {
            console.error(`Lỗi khi xử lý getCustomerData: ${error.message}`);
            await taskService.handleFailure(task, { errorMessage: error.message });
        }
    });
}

module.exports = registerGetCustomerDataWorker;