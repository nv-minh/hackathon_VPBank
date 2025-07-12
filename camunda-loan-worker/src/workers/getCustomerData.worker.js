/**
 * Đăng ký worker để lấy dữ liệu khách hàng
 * @param {object} client - Camunda External Task Client
 * @param {object} pool - Pool kết nối PostgreSQL đã được khởi tạo
 * @param {object} redisClient - Client Redis đã được khởi tạo và kết nối
 */
function registerGetCustomerDataWorker(client, pool, redisClient) {
    client.subscribe("getCustomerData", async ({ task, taskService }) => {
        console.log(`⚡️ Nhận được tác vụ [getCustomerData]...`);
        const applicationId = task.variables.get("applicationId");

        if (!applicationId) {
            return await taskService.handleFailure(task, { errorMessage: "Thiếu applicationId." });
        }

        const cacheKey = `customer:${applicationId}`;

        try {
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
            const query = `
    SELECT
    la.application_id,
    la.camunda_process_instance_id,
    la.loan_amount,
    la.loan_intent,
    la.loan_grade,
    la.interest_rate,
    la.loan_term,
    la.percent_income,
    la.status,
    la.llm_analysis_result,
    la.created_at AS application_created_at,
    la.updated_at,

    c.customer_id,
    c.full_name,
    c.email,
    c.keycloak_user_id,

    p.profile_id,
    p.age,
    p.income,
    p.home_ownership,
    p.employment_length_years,
    p.default_on_file,
    p.credit_history_length_years,
    p.created_at AS profile_created_at
FROM
    loan_applications la
JOIN
    customers c ON la.customer_id = c.customer_id
JOIN
    application_profiles p ON la.profile_id = p.profile_id
WHERE
    la.application_id = $${applicationId}; 
`;
            const { rows } = await pool.query(query, [applicationId]);

            if (rows.length === 0) {
                return await taskService.handleBpmnError(task, "DATA_NOT_FOUND", `Không tìm thấy dữ liệu cho đơn vay id = ${applicationId}`);
            }

            const customerData = rows[0];

            // 3. Lưu kết quả vào cache (hết hạn sau 1 giờ)
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